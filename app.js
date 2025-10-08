const { input, select, checkbox} = require('@inquirer/prompts');

let musicas = [];
let playlists = [];

console.log("=== 🎵 Gerenciador de Músicas ===");
menu();

async function menu() {
    while (true) {
        const opcao = await select({
            message: "Escolha uma opção:",
            choices: [
                { name: "Cadastrar Música", value: "cadastrarMusica" },
                { name: "Criar Playlist", value: "criarPlaylist" },
                { name: "Adicionar Música à Playlist", value: "adicionarMusicaPlaylist" },
                { name: "Marcar Música como Favorita", value: "marcarFavorita" },
                { name: "Avaliar Música", value: "avaliarMusica" },
                { name: "Mostrar Estatísticas", value: "estatisticas" },
                { name: "Mostrar Tabelas", value: "tabelas" },
                { name: "Sair", value: "sair" }
            ]
        });

        switch(opcao) {
            case "cadastrarMusica": await cadastrarMusica(); break;
            case "criarPlaylist": await criarPlaylist(); break;
            case "adicionarMusicaPlaylist": await adicionarMusicaPlaylist(); break;
            case "marcarFavorita": await marcarFavorita(); break;
            case "avaliarMusica": await avaliarMusica(); break;
            case "estatisticas": 
                console.log("\n📊 Estatísticas:");
                console.log("Gênero favorito:", generoFavorito());
                console.log("Artista mais ouvido:", artistaMaisOuvido());
                console.log("Músicas recentes (7 dias):", musicasRecentes().map(m => m.titulo).join(", ") || "Nenhuma");
                break;
            case "tabelas": mostrarTabelas(); break;
            case "sair": 
                console.log("👋 Até a próxima!");
                process.exit();
        }
    }
}

// Funções do sistema
function gerarId(array) {
    return array.length > 0 ? array[array.length - 1].id + 1 : 1;
}

async function cadastrarMusica() {
    const titulo = await input({ message: "Título da música:" });
    const artista = await input({ message: "Artista:" });
    const album = await input({ message: "Álbum:" });
    const genero = await input({ message: "Gênero:" });
    const duracao = parseInt(await input({ message: "Duração em segundos:" }));
    const ano = parseInt(await input({ message: "Ano de lançamento:" }));

    const musica = {
        id: gerarId(musicas),
        titulo,
        artista,
        album,
        genero,
        duracao,
        ano,
        favorita: false,
        avaliacao: 0,
        dataAdicao: new Date().toISOString().split('T')[0]
    };
    musicas.push(musica);
    console.log("✅ Música cadastrada com sucesso!");
}

async function criarPlaylist() {
    const nome = await input({ message: "Nome da playlist:" });
    const descricao = await input({ message: "Descrição:" });

    const playlist = {
        id: gerarId(playlists),
        nome,
        descricao,
        musicas: [],
        dataCriacao: new Date().toISOString().split('T')[0]
    };
    playlists.push(playlist);
    console.log("✅ Playlist criada com sucesso!");
}

async function adicionarMusicaPlaylist() {
    if (playlists.length === 0 || musicas.length === 0) {
        console.log("⚠️  Cadastre pelo menos uma música e uma playlist primeiro!");
        return;
    }

    const playlistEscolhida = await select({
        message: "Selecione a playlist:",
        choices: playlists.map(p => ({ name: p.nome, value: p.id }))
    });

    const musicaEscolhida = await select({
        message: "Selecione a música para adicionar:",
        choices: musicas.map(m => ({ name: `${m.titulo} - ${m.artista}`, value: m.id }))
    });

    const playlist = playlists.find(p => p.id === playlistEscolhida);
    playlist.musicas.push(musicaEscolhida);
    console.log("✅ Música adicionada à playlist!");
}

async function marcarFavorita() {
    if (musicas.length === 0) return console.log("⚠️ Nenhuma música cadastrada.");

    const musicaEscolhida = await select({
        message: "Selecione a música para marcar como favorita:",
        choices: musicas.map(m => ({ name: `${m.titulo} - ${m.artista}`, value: m.id }))
    });

    const musica = musicas.find(m => m.id === musicaEscolhida);
    musica.favorita = true;
    console.log("⭐ Música marcada como favorita!");
}

async function avaliarMusica() {
    if (musicas.length === 0) return console.log("⚠️ Nenhuma música cadastrada.");

    const musicaEscolhida = await select({
        message: "Selecione a música para avaliar:",
        choices: musicas.map(m => ({ name: `${m.titulo} - ${m.artista}`, value: m.id }))
    });

    const avaliacao = parseInt(await input({ message: "Avaliação (1-5):" }));
    if (avaliacao < 1 || avaliacao > 5) return console.log("❌ Avaliação inválida!");

    const musica = musicas.find(m => m.id === musicaEscolhida);
    musica.avaliacao = avaliacao;
    console.log("✅ Música avaliada!");
}

// Estatísticas
function generoFavorito() {
    const contador = {};
    musicas.forEach(m => contador[m.genero] = (contador[m.genero] || 0) + 1);
    const favorito = Object.keys(contador).reduce((a, b) => contador[a] > contador[b] ? a : b, null);
    return favorito || "Nenhum";
}

function artistaMaisOuvido() {
    const contador = {};
    musicas.forEach(m => contador[m.artista] = (contador[m.artista] || 0) + 1);
    const favorito = Object.keys(contador).reduce((a, b) => contador[a] > contador[b] ? a : b, null);
    return favorito || "Nenhum";
}

function musicasRecentes(dias = 7) {
    const hoje = new Date();
    return musicas.filter(m => {
        const dataAdicao = new Date(m.dataAdicao);
        return (hoje - dataAdicao) / (1000 * 60 * 60 * 24) <= dias;
    });
}

function mostrarTabelas() {
    console.log("\n🎵 Músicas:");
    console.table(musicas.map(m => ({
        ID: m.id,
        Título: m.titulo,
        Artista: m.artista,
        Álbum: m.album,
        Gênero: m.genero,
        Duração: m.duracao,
        Ano: m.ano,
        Favorita: m.favorita ? "⭐" : "",
        Avaliação: m.avaliacao
    })));

    console.log("\n📂 Playlists:");
    console.table(playlists.map(p => ({
        ID: p.id,
        Nome: p.nome,
        Descrição: p.descricao,
        Músicas: p.musicas.map(id => musicas.find(m => m.id === id)?.titulo).join(", "),
        CriadaEm: p.dataCriacao
    })));
}





