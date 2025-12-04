document.addEventListener('DOMContentLoaded', () => {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const originalImages = document.querySelectorAll('.slider-wrapper img');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');

    const totalOriginalImages = originalImages.length;
    // Largura de UMA imagem, conforme o CSS (300px)
    const imageWidth = 300; 

    // Para o loop suave (exibir 3 e mover 1), precisamos clonar as imagens
    const clonesToPrepend = 2; // Clona as duas últimas originais (5 e 6) para o início
    const clonesToAppend = 2;  // Clona as duas primeiras originais (1 e 2) para o fim
    
    // O índice VIRTUAL: aponta para a primeira imagem do wrapper (que é uma das imagens clonadas)
    // O slider começa no índice 2, que é onde a primeira imagem original (Imagem 1) estará.
    let currentIndex = clonesToPrepend; 

    // --- 1. CLONAGEM E MONTAGEM DO SLIDER ---
    
    // Adiciona clones no INÍCIO (Imagens 5 e 6)
    for (let i = totalOriginalImages - clonesToPrepend; i < totalOriginalImages; i++) {
        const clone = originalImages[i].cloneNode(true);
        sliderWrapper.prepend(clone);
    }
    
    // Adiciona clones no FIM (Imagens 1 e 2)
    for (let i = 0; i < clonesToAppend; i++) {
        const clone = originalImages[i].cloneNode(true);
        sliderWrapper.appendChild(clone);
    }

    // Pega TODAS as imagens (originais + clones)
    const allImages = document.querySelectorAll('.slider-wrapper img');
    const totalVirtualImages = allImages.length; // Agora é 10 (2 clones + 6 originais + 2 clones)

    /**
     * Atualiza a posição do slider e o destaque da imagem central.
     */
    function updateSlider() {
        // Calcula o deslocamento. Como movemos de 1 em 1, multiplicamos o índice pela largura.
        const offset = -currentIndex * imageWidth; 
        sliderWrapper.style.transform = `translateX(${offset}px)`;

        // Remove a classe 'active' de todas as imagens
        allImages.forEach(img => {
            img.classList.remove('active');
        });

        // Adiciona a classe 'active' à imagem central
        // A imagem central é sempre a que está no índice atual + 1
        const centerIndex = currentIndex + 1;
        if (allImages[centerIndex]) {
            allImages[centerIndex].classList.add('active');
        }

        // --- 2. LÓGICA DO LOOP INFINITO (Teletransporte sem transição) ---
        // A transição é removida, o wrapper é reposicionado e a transição é reativada
        
        // Se chegarmos no final das imagens originais (o clone 1 está no centro)
        if (currentIndex === totalOriginalImages + clonesToAppend - 1) { // Ex: índice 7
            setTimeout(() => {
                sliderWrapper.style.transition = 'none';
                currentIndex = clonesToPrepend + (currentIndex - totalOriginalImages); // Ex: volta para o índice 2
                sliderWrapper.style.transform = `translateX(${-currentIndex * imageWidth}px)`;
            }, 320); // match CSS transition time (320ms)
                setTimeout(() => {
                    sliderWrapper.style.transition = 'transform 0.32s ease-in-out';
                }, 321);
        }
        
        // Se chegarmos no início (o clone 6 está no centro)
        if (currentIndex === 0) { // Ex: índice 0
            setTimeout(() => {
                sliderWrapper.style.transition = 'none';
                currentIndex = totalOriginalImages; // Volta para o índice 6 (onde a última original está)
                sliderWrapper.style.transform = `translateX(${-currentIndex * imageWidth}px)`;
            }, 320);
            setTimeout(() => {
                sliderWrapper.style.transition = 'transform 0.32s ease-in-out';
            }, 321);
        }
    }

    // --- 3. CONTROLES DE NAVEGAÇÃO ---

    function goToNext() {
        if (currentIndex < totalVirtualImages - clonesToAppend) {
            currentIndex++;
            updateSlider();
        }
    }

    function goToPrev() {
        if (currentIndex > clonesToPrepend - 1) {
            currentIndex--;
            updateSlider();
        }
    }

    // Inicialização
    nextButton.addEventListener('click', goToNext);
    prevButton.addEventListener('click', goToPrev);
    
    // Posiciona o slider no ponto inicial (onde a Imagem 1 é a imagem central)
    updateSlider(); 
});