function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa=false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3),
    ]

    let deslocamento = 3
    const aumentoDeslocamento = 0.3
    const maxDeslocamento = 12
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouOMeio) {
                notificarPonto()
                if (deslocamento < maxDeslocamento) {
                    deslocamento += aumentoDeslocamento;
                }
            }
        })
    }
}

function Harry(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'harry')
    this.elemento.src = 'imgs/harry.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 7 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    
    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colisao(harry, barreiras) {
    let colisao = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colisao) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colisao = estaoSobrepostos(harry.elemento, superior)
                || estaoSobrepostos(harry.elemento, inferior)
        }
    })
    return colisao
}

function FlyingHarry() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[gm-harry]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const mensagemGameOver = document.getElementById("mensagem-game-over")

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 250, 400,
        () => progresso.atualizarPontos(++pontos))
        const harry = new Harry(altura)

        areaDoJogo.appendChild(progresso.elemento)
        areaDoJogo.appendChild(harry.elemento)
        barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

        this.start = () => {
            const temporizador = setInterval(() => {
                barreiras.animar()
                harry.animar()
                

                if (colisao(harry, barreiras)) [
                    clearInterval(temporizador),
                    mensagemGameOver.classList.remove("oculto"),
                    setTimeout(() => {
                        window.location.reload();
                      }, 2000)
                ]
            }, 20)
        }

}

const jogo = new FlyingHarry();

function iniciarJogo() {
    jogo.start();
}

const botaoIniciar = document.getElementById('start')
botaoIniciar.addEventListener('click', iniciarJogo)