import os, json, base64, tempfile
from flask import Flask, request
from google.cloud import storage, logging as gclog
import openai, pdfkit

app = Flask(__name__)
log = gclog.Client().get_default_logger()
openai.api_key = os.environ['OPENAI_API_KEY']
bucket = storage.Client().bucket(os.environ['BUCKET_NAME'])

PROMPT_TEMPLATE = """
You are an HR expert. Rewrite the following résumé so that it precisely targets the job description.
Output in ATS-friendly plain text.

===JOB-DESCRIPTION===
{jd}
===RESUME===
{cv}
"""

def build_pdf(text: str) -> bytes:
    html = f"<pre style='font-family:Arial;'>{text}</pre>"
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as f:
        pdfkit.from_string(html, f.name)
        f.seek(0)
        return f.read()

@app.route("/", methods=["POST"])
def consume_event():
    envelope = request.get_json()
    data = json.loads(base64.b64decode(envelope['message']['data']).decode())
    session = data['data']['object']
    jd = session['metadata']['jd_url']
    cv = session['metadata']['cv_text']
    prompt = PROMPT_TEMPLATE.format(jd=jd, cv=cv)
    completion = openai.ChatCompletion.create(
        model='gpt-4o-mini',
        messages=[{"role":"user","content":prompt}]
    )
    new_cv = completion.choices[0].message.content

    pdf_bytes = build_pdf(new_cv)
    blob = bucket.blob(f"{session['id']}.pdf")
    blob.upload_from_string(pdf_bytes, content_type='application/pdf')
    url = blob.generate_signed_url(version='v4', expiration=3600)

    log.log_text(f"Generated résumé for {session['customer_email']}: {url}")
    return ("", 204)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
