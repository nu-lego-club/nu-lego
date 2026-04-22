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
            }, 1500);
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

    // 2. Dynamic Gallery Loading
    const galleryGrid = document.querySelector('.gallery-grid');
    
    const renderGallery = (works) => {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        
        if (!works || works.length === 0) {
            galleryGrid.innerHTML = '<div class="loading-spinner">作品が見つかりませんでした。</div>';
            return;
        }

        works.forEach((work, index) => {
            const delay = (index % 3) * 0.1;
            const itemHtml = `
                <div class="gallery-item fade-in-up" data-category="${work.category}" style="transition-delay: ${delay}s">
                    <div class="gallery-img-wrapper">
                        <img src="${work.imageUrl}" alt="${work.title}" onerror="this.src='https://via.placeholder.com/600x400/f5f5f7/86868b?text=No+Image'">
                    </div>
                    <div class="gallery-info">
                        <h3>${work.title}</h3>
                        <p class="author-text">制作: ${work.author}</p>
                        <div class="gallery-tags">
                            <span class="tag">#${work.category}</span>
                        </div>
                    </div>
                </div>
            `;
            galleryGrid.insertAdjacentHTML('beforeend', itemHtml);
        });
        
        // 追加された動的要素に対してもObserverを適用
        initObserver();
    };

    const loadGallery = async () => {
        try {
            // ローカルファイルをブラウザで直接開くと、セキュリティ(CORS)によりfetchがブロックされる場合があります
            const response = await fetch('data/gallery.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const works = await response.json();
            renderGallery(works);
        } catch (error) {
            console.error('Gallery loading error:', error);
            // fetchが失敗した場合（ローカル実行時など）のフォールバック
            galleryGrid.innerHTML = '<div class="loading-spinner">ギャラリーを読み込めませんでした。<br><small>サーバー上で実行するか、VSCodeのLive Serverなどをご利用ください。</small></div>';
        }
    };

    loadGallery();

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
