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
        document.getElementById('modal-img').src = work.imageUrl || 'https://via.placeholder.com/600x400/f5f5f7/86868b?text=NO+IMAGE';
        document.getElementById('modal-tag').textContent = `#${work.category}`;
        document.getElementById('modal-title').textContent = work.title;
        document.getElementById('modal-author').textContent = `制作: ${work.author}`;
        document.getElementById('modal-desc').textContent = work.description || '説明はありません。';
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // --- Dynamic Gallery Loading ---
    const galleryGrid = document.querySelector('.gallery-grid');
    
    const getThumbnailUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/600x400/f5f5f7/86868b?text=NO+IMAGE';
        if (url.includes('lh3.googleusercontent.com')) {
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
                    <img src="${thumbnailUrl}" alt="${work.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/600x400/f5f5f7/86868b?text=NO+IMAGE'">
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

            const imgUrl = col.imageUrl || 'https://via.placeholder.com/600x400/f5f5f7/86868b?text=NO+IMAGE';
            article.innerHTML = `
                <div class="column-img-wrapper" style="height: 180px; overflow: hidden; border-radius: 12px; margin-bottom: 1rem;">
                    <img src="${imgUrl}" alt="${col.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.src='https://via.placeholder.com/600x400/f5f5f7/86868b?text=NO+IMAGE'">
                </div>
                <div class="column-date">${col.date}</div>
                <h3>${col.title}</h3>
                <p class="column-excerpt">${excerpt}</p>
            `;
            
            columnsGrid.appendChild(article);
        });

        initObserver();
    };

    const loadColumns = async () => {
        if (!columnsGrid) return;
        try {
            const response = await fetch('data/Column.json');
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

    // --- Dynamic Instagram Embed Loading ---
    const instagramGrid = document.querySelector('.instagram-embed-grid');

    const loadInstagramEmbeds = async () => {
        if (!instagramGrid) return;
        try {
            const response = await fetch('data/instagram.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            instagramGrid.innerHTML = '';
            if (!data || data.length === 0) {
                instagramGrid.innerHTML = '<div class="loading-spinner">Instagramの投稿がありません。</div>';
                return;
            }

            // 最新の3件だけ表示
            const displayData = data.slice(0, 3);
            displayData.forEach((item, index) => {
                const delay = index * 0.1;
                const wrapper = document.createElement('div');
                wrapper.className = 'instagram-embed-wrapper fade-in-up';
                wrapper.style.transitionDelay = `${delay}s`;
                wrapper.innerHTML = item.embedCode;
                instagramGrid.appendChild(wrapper);
            });

            // Instagram埋め込みスクリプトの再実行（必要な場合）
            if (window.instgrm) {
                window.instgrm.Embeds.process();
            } else {
                const script = document.createElement('script');
                script.src = "//www.instagram.com/embed.js";
                script.async = true;
                document.body.appendChild(script);
            }

            initObserver();
        } catch (error) {
            console.error('Instagram loading error:', error);
            instagramGrid.innerHTML = '<div class="loading-spinner">Instagramの投稿を読み込めませんでした。</div>';
        }
    };

    loadInstagramEmbeds();

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

    // 4. Contact Form Submit (GAS Web App Integration)
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = '送信中...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                type: document.getElementById('type').value,
                message: document.getElementById('message').value
            };

            // TODO: Replace with the deployed GAS Web App URL
            const GAS_WEB_APP_URL = 'YOUR_GAS_WEB_APP_URL_HERE';

            try {
                const response = await fetch(GAS_WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify(formData),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded' // GAS requires this for CORS sometimes, or just text/plain. Actually GAS handles text/plain well for CORS.
                    }
                });

                if (!response.ok) throw new Error('Network response was not ok');

                btn.textContent = '送信完了 (自動通知しました)';
                btn.style.backgroundColor = '#28a745'; // Success green
                btn.style.color = '#fff';
                btn.style.opacity = '1';
                form.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 3000);

            } catch (error) {
                console.error('Submit error:', error);
                btn.textContent = 'エラーが発生しました';
                btn.style.backgroundColor = '#dc3545'; // Error red
                btn.style.color = '#fff';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 3000);
            }
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
