FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

WORKDIR /app

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Run the scraper
# Note: since the script currently runs once and exits, the container will stop after scraping.
# In a real environment, you might run this via a cron daemon or a while loop.
CMD ["python", "-u", "scraper.py"]
