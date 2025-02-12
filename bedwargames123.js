
      document.addEventListener('DOMContentLoaded', function() {
    fetch('https://cdn.jsdelivr.net/gh/IlovetocodeBFG/BIGFISHGAMING@refs/heads/main/gamelist.txt')
        .then(response => response.text())
        .then(data => {
            const gameGrid = document.getElementById('games');
            
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = data;
            
            const gameLinks = tempContainer.getElementsByTagName('a');
            Array.from(gameLinks).forEach(link => {
                const url = link.getAttribute('data-url');
                const img = link.querySelector('img');
                
                const gameLink = document.createElement('a');
                gameLink.href = '#';
                gameLink.innerHTML = `<img src="${img.src}" alt="game">`;
                
                gameLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const win = window.open('about:blank', '_blank');
                    win.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Teehee When I See You it's Game Over :)</title>
                            <link rel="icon" href="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://clever.com&size=64" type="image/x-icon">
                            <style>
                                body, html {
                                    margin: 0;
                                    padding: 0;
                                    width: 100%;
                                    height: 100%;
                                    overflow: hidden;
                                    background: #000;
                                }
                                iframe {
                                    width: 100%;
                                    height: 100%;
                                    border: none;
                                }
                            </style>
                        </head>
                        <body>
                            <iframe src="${url}" allowfullscreen></iframe>
                        </body>
                        </html>
                    `);
                    win.document.close();
                });
                
                gameGrid.appendChild(gameLink);
            });
        })
        .catch(error => {
            console.error('Error loading games:', error);
        });
});
      
