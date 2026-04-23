// main.js - 名大レゴ部公式サイト JavaScript

document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Preloader Removal
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            // アニメーションをしっかり見せるために少しだけ待機
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 600);
            }, 4000);
        }
    });
    
    // 1. Scroll Animations (Fade-in-up)
    const initObserver = () => {
        const fadeElements = document.querySelectorAll('.fade-in-up');
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(el => {
            observer.observe(el);
        });
    };

    // 初回実行（HTMLに元々ある要素用）
    initObserver();

    // --- Modal Control ---
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-close">✕</div>
            <div class="modal-body">
                <div class="modal-img-side">
                    <img src="" alt="" id="modal-img">
                </div>
                <div class="modal-info-side">
                    <span class="tag" id="modal-tag"></span>
                    <h2 id="modal-title"></h2>
                    <p class="modal-author" id="modal-author"></p>
                    <div class="modal-description" id="modal-desc"></div>
                    <div class="modal-comments-section">
                        <h4>コメント</h4>
                        <div id="modal-comments">
                            <!-- Comments will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const openModal = (work) => {
        document.getElementById('modal-img').src = work.imageUrl;
        document.getElementById('modal-tag').textContent = `#${work.category}`;
        document.getElementById('modal-title').textContent = work.title;
        document.getElementById('modal-author').textContent = `制作: ${work.author}`;
        document.getElementById('modal-desc').textContent = work.description || '説明はありません。';
        
        const commentsContainer = document.getElementById('modal-comments');
        commentsContainer.innerHTML = '';
        
        if (work.comments && work.comments.length > 0) {
            work.comments.forEach(comment => {
                const commentEl = document.createElement('div');
                commentEl.className = 'comment-item';
                commentEl.innerHTML = `
                    <span class="comment-user">${comment.user}</span>
                    <p class="comment-text">${comment.text}</p>
                `;
                commentsContainer.appendChild(commentEl);
            });
        } else {
            commentsContainer.innerHTML = '<p class="text-gray text-sm">コメントはまだありません。</p>';
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // --- Dynamic Gallery Loading ---
    const galleryGrid = document.querySelector('.gallery-grid');
    
    const getThumbnailUrl = (url) => {
        if (url && url.includes('lh3.googleusercontent.com')) {
            const baseUrl = url.split('=')[0];
            return `${baseUrl}=s600`; 
        }
        return url;
    };
    
    const renderGallery = (works, limit = null) => {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        
        if (!works || works.length === 0) {
            galleryGrid.innerHTML = '<div class="loading-spinner">作品が見つかりませんでした。</div>';
            return;
        }

        const displayWorks = limit ? works.slice(0, limit) : works;

        displayWorks.forEach((work, index) => {
            const delay = (index % 3) * 0.1;
            const thumbnailUrl = getThumbnailUrl(work.imageUrl);
            
            const item = document.createElement('div');
            item.className = 'gallery-item fade-in-up';
            item.setAttribute('data-category', work.category);
            item.style.transitionDelay = `${delay}s`;
            item.innerHTML = `
                <div class="gallery-img-wrapper">
                    <img src="${thumbnailUrl}" alt="${work.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/600x400/f5f5f7/86868b?text=No+Image'">
                </div>
                <div class="gallery-info">
                    <h3>${work.title}</h3>
                    <p class="author-text">制作: ${work.author}</p>
                    <div class="gallery-tags">
                        <span class="tag">#${work.category}</span>
                    </div>
                </div>
            `;
            
            // クリックイベントの追加
            item.addEventListener('click', () => openModal(work));
            
            galleryGrid.appendChild(item);
        });
        
        initObserver();
    };

    const loadGallery = async () => {
        if (!galleryGrid) return;
        try {
            const response = await fetch('data/gallery.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const works = await response.json();
            
            // ページの種類によって表示件数を変える
            const isHomePage = document.body.classList.contains('home-page');
            renderGallery(works, isHomePage ? 4 : null); 
        } catch (error) {
            console.error('Gallery loading error:', error);
            galleryGrid.innerHTML = '<div class="loading-spinner">ギャラリーを読み込めませんでした。</div>';
        }
    };

    loadGallery();

    // --- Dynamic Columns Loading ---
    const columnsGrid = document.querySelector('.columns-grid');

    const renderColumns = (columns) => {
        if (!columnsGrid) return;
        columnsGrid.innerHTML = '';

        if (!columns || columns.length === 0) {
            columnsGrid.innerHTML = '<div class="loading-spinner">活動報告がありません。</div>';
            return;
        }

        columns.forEach((col, index) => {
            const delay = (index % 3) * 0.1;
            const article = document.createElement('article');
            article.className = 'column-card fade-in-up';
            article.style.transitionDelay = `${delay}s`;
            
            // Limit excerpt length
            const excerpt = col.content.length > 80 ? col.content.substring(0, 80) + '...' : col.content;

            article.innerHTML = `
                <div class="column-date">${col.date}</div>
                <h3>${col.title}</h3>
                <p class="column-excerpt">${excerpt}</p>
                <span class="column-source wood-text">${col.source || 'Googleフォームより自動生成'}</span>
            `;
            
            columnsGrid.appendChild(article);
        });

        initObserver();
    };

    const loadColumns = async () => {
        if (!columnsGrid) return;
        try {
            const response = await fetch('data/columns.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const columns = await response.json();
            
            // Show only the latest 2 columns on the homepage
            const isHomePage = document.body.classList.contains('home-page');
            renderColumns(isHomePage ? columns.slice(0, 2) : columns); 
        } catch (error) {
            console.error('Columns loading error:', error);
            columnsGrid.innerHTML = '<div class="loading-spinner">活動報告を読み込めませんでした。</div>';
        }
    };

    loadColumns();

    // 3. Gallery Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const items = document.querySelectorAll('.gallery-item');

            items.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; }, 10);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // 3. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 4. Contact Form Mock Submit (Discord Integration mock)
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = '送信中...';
            btn.style.opacity = '0.7';

            // Simulate API call to Make/Discord
            setTimeout(() => {
                btn.textContent = '送信完了 (Discordへ通知しました)';
                btn.style.backgroundColor = '#28a745'; // Success green
                btn.style.color = '#fff';
                btn.style.opacity = '1';
                form.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                }, 3000);
            }, 1000);
        });
    }

    // 5. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            // Prevent scrolling when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});
