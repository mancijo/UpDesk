async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const mensagem = document.getElementById('mensagem');

    const resposta = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
    });



    const dados = await resposta.json();

    if (resposta.ok) {
        window.location.href = "/home"; // redireciona
    } else {
        mensagem.style.color = 'red';
        mensagem.innerText = dados.mensagem;
    }
}