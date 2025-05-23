FROM python:3.10-slim

# システム依存パッケージ
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libffi-dev \
      libssl-dev \
      wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /app

# 依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコピー
COPY main.py .

# Cloud Run 起動コマンド
CMD exec gunicorn --bind :$PORT main:app
