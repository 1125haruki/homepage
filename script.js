
document.addEventListener('DOMContentLoaded', () => {
    // FAQアコーディオン機能
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            question.classList.toggle('active');
            if (answer.style.display === "block") {
                answer.style.display = "none";
            } else {
                answer.style.display = "block";
            }
        });
    });

    // スクロールアニメーション (Intersection Observer API)
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                // 実績セクションの数字カウントアップ
                if (entry.target.id === 'achievements') {
                    const numbers = entry.target.querySelectorAll('.achievement-number');
                    numbers.forEach(num => {
                        const target = parseInt(num.innerText.replace('+', '').replace('人', '').replace('%', ''));
                        let current = 0;
                        const increment = target / 100; // 100フレームでカウントアップ

                        const updateCount = () => {
                            if (current < target) {
                                current += increment;
                                num.innerText = Math.ceil(current) + (num.innerText.includes('+') ? '+' : '') + (num.innerText.includes('人') ? '人' : '') + (num.innerText.includes('%') ? '%' : '');
                                requestAnimationFrame(updateCount);
                            } else {
                                num.innerText = target + (num.innerText.includes('+') ? '+' : '') + (num.innerText.includes('人') ? '人' : '') + (num.innerText.includes('%') ? '%' : '');
                            }
                        };
                        updateCount();
                    });
                }
                // セクションタイトルにグリッチアニメーションを適用 (一度だけ)
                const sectionTitle = entry.target.querySelector('.section-title');
                if (sectionTitle && !sectionTitle.classList.contains('glitch-applied')) {
                    sectionTitle.classList.add('glitch-text');
                    sectionTitle.classList.add('glitch-applied'); // 複数回アニメーションが実行されないようにマーク
                }
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateOnScroll, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // 10%表示されたらアニメーション開始
    });

    // アニメーション対象のセクションを監視
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // 背景動画の自動切り替え (ディゾルブあり)
    const videoPlayer = document.querySelector('.hero-video-background');
    const heroOverlay = document.querySelector('.hero-overlay'); // オーバーレイ要素を取得
    const videoSources = [
        'movie/movie1.mp4',
        'movie/movie2.mp4',
        'movie/movie3.mp4',
        'movie/movie4.mp4'
    ];
    let currentVideoIndex = 0;
    let fadeOutTimeout;

    // モバイルデバイス判定
    const isMobile = () => {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768; // 画面幅でも判定
    };

    // 動画再生関数
    function switchVideo() {
        // フェードアウト開始
        heroOverlay.classList.add('active');

        // フェードアウト完了後に動画を切り替える
        setTimeout(() => {
            videoPlayer.src = videoSources[currentVideoIndex];
            videoPlayer.load();
            videoPlayer.play();

            // 動画が再生開始されたらフェードイン開始
            videoPlayer.onplay = () => {
                heroOverlay.classList.remove('active');
                videoPlayer.onplay = null; // イベントリスナーを一度だけ実行するために解除
                // 次の動画の終了を監視開始
                scheduleNextVideoSwitch();
            };

            currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
        }, 1000); // CSSのtransition時間と合わせる (1秒)
    }

    function scheduleNextVideoSwitch() {
        if (fadeOutTimeout) {
            clearTimeout(fadeOutTimeout);
        }

        videoPlayer.onloadedmetadata = () => {
            const fadeOutDuration = 1000; // 1秒 (CSSのtransitionと合わせる)
            const videoDuration = videoPlayer.duration * 1000; // ミリ秒に変換
            const switchTime = videoDuration - fadeOutDuration;

            if (switchTime > 0) {
                fadeOutTimeout = setTimeout(() => {
                    switchVideo();
                }, switchTime);
            } else {
                // 動画が短い場合、すぐに切り替える
                switchVideo();
            }
        };
    }

    // 最初の動画を再生
    switchVideo();

    // 初期動画の終了を監視開始 (loadedmetadataがすでに発生している可能性があるのでここで呼び出す)
    scheduleNextVideoSwitch();

    // モバイルの場合、動画の自動再生を停止し、クリックで再生できるようにする
    if (isMobile()) {
        videoPlayer.pause();
        heroOverlay.style.cursor = 'pointer'; // カーソルをポインターに

        const playButton = document.createElement('div');
        playButton.classList.add('mobile-video-play-button');
        playButton.innerHTML = '▶'; // 再生アイコン
        heroOverlay.appendChild(playButton);

        heroOverlay.addEventListener('click', () => {
            if (videoPlayer.paused) {
                videoPlayer.play();
                playButton.style.display = 'none'; // 再生ボタンを非表示
            } else {
                videoPlayer.pause();
                playButton.style.display = 'block'; // 再生ボタンを表示
            }
        });
    }

});
