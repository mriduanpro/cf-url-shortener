document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const shortenBtn = document.getElementById('shortenBtn');
    const resultDiv = document.getElementById('result');
    const shortUrlDisplay = document.getElementById('shortUrlDisplay');
    const originalUrlDisplay = document.getElementById('originalUrlDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const errorDiv = document.getElementById('error');

    const API_URL = '/api/shorten'; // Redirect ke Worker

    shortenBtn.addEventListener('click', async () => {
        const longUrl = urlInput.value.trim();
        
        // Validasi
        if (!longUrl) {
            showError('Masukkan URL terlebih dahulu!');
            return;
        }
        
        if (!isValidUrl(longUrl)) {
            showError('URL tidak valid! Pastikan diawali dengan http:// atau https://');
            return;
        }

        shortenBtn.disabled = true;
        shortenBtn.textContent = 'Memproses...';
        hideError();
        hideResult();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: longUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mempersingkat URL');
            }

            showResult(data.shortUrl, data.originalUrl);
        } catch (error) {
            showError(error.message);
        } finally {
            shortenBtn.disabled = false;
            shortenBtn.textContent = 'Shorten';
        }
    });

    // Enter key support
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            shortenBtn.click();
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const text = shortUrlDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('URL telah disalin!');
        });
    });

    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    function showResult(shortUrl, originalUrl) {
        shortUrlDisplay.textContent = shortUrl;
        originalUrlDisplay.textContent = `Original: ${originalUrl}`;
        resultDiv.classList.remove('hidden');
        resultDiv.style.display = 'block';
    }

    function hideResult() {
        resultDiv.style.display = 'none';
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.add('visible');
        errorDiv.style.display = 'block';
    }

    function hideError() {
        errorDiv.classList.remove('visible');
        errorDiv.style.display = 'none';
    }
});
