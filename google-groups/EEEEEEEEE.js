 document.addEventListener('DOMContentLoaded', function() {
            const gamesText = document.querySelector('.games-text');
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                if (scrollPosition > 100) {
                    gamesText.style.opacity = '0';
                } else {
                    gamesText.style.opacity = '0.8';
                }
            });

            const searchBar = document.querySelector('input');
            const gamesGrid = document.getElementById('gamesGrid');
            let allGames = [];

            fetch('https://cdn.jsdelivr.net/gh/IlovetocodeBFG/BIGFISHGAMING@refs/heads/main/nolist.txt')
                .then(response => response.text())
                .then(data => {
                    const tempContainer = document.createElement('div');
                    tempContainer.innerHTML = data;
                    
                    const gameLinks = tempContainer.getElementsByTagName('a');
                    
                    allGames = Array.from(gameLinks).map((link, index) => {
                        const img = link.querySelector('img');
                        return {
                            url: link.getAttribute('data-url'),
                            image: img?.src || '',
                            title: img?.getAttribute('title') || img?.alt || `Game ${index + 1}`
                        };
                    });

                    renderGames(allGames);
                })
                .catch(error => {
                    console.error('Error loading games:', error);
                    gamesGrid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-8">Error loading games. Please try again later.</p>';
                });

            function renderGames(games) {
                gamesGrid.innerHTML = games.map((game, index) => `
                    <div class="game-card opacity-0 aspect-square rounded-xl overflow-hidden relative cursor-pointer border-2 border-transparent hover:border-primary hover:-translate-y-1 transition-all bg-slate-800/50 group"
                         data-url="${game.url}" 
                         data-title="${game.title}" 
                         style="--i: ${index + 1}">
                        <img src="${game.image}" 
                             alt="${game.title}" 
                             class="game-image w-full h-full object-cover">
                        <div class="game-info absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                            <div class="text-sm font-semibold text-center">${game.title}</div>
                        </div>
                    </div>
                `).join('');
            }

            searchBar.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredGames = allGames.filter(game => 
                    game.title.toLowerCase().includes(searchTerm)
                );
                renderGames(filteredGames);
            });

            gamesGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.game-card');
                if (!card) return;

                const url = card.dataset.url;
                gameTitle.textContent = card.dataset.title;
                gamePopup.classList.add('active');
                
                const iframe = document.createElement('iframe');
                iframe.className = 'w-full h-full border-0';
                iframe.src = url;
                iframe.allowFullscreen = true;
                
                gameFrame.innerHTML = '';
                gameFrame.appendChild(iframe);
            });

            fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    gameFrame.requestFullscreen();
                    fullscreenBtn.innerHTML = '<i class="ri-fullscreen-exit-line text-lg"></i>';
                } else {
                    document.exitFullscreen();
                    fullscreenBtn.innerHTML = '<i class="ri-fullscreen-line text-lg"></i>';
                }
            });

            function closePopup() {
                gamePopup.classList.remove('active');
                setTimeout(() => {
                    gameFrame.innerHTML = '';
                }, 300);
            }

            closeBtn.addEventListener('click', closePopup);
            overlay.addEventListener('click', closePopup);

            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    fullscreenBtn.innerHTML = '<i class="ri-fullscreen-line text-lg"></i>';
                }
            });
        });
