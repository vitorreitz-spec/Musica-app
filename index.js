
const { input, select } = require('@inquirer/prompts');


const fs = require('fs'); 
const path = require('path');


const caminhoMusicas = path.join(__dirname, 'musicas.json');
const caminhoPlaylists = path.join(__dirname, 'playlists.json');


function lerJSON(caminho) {
    if (!fs.existsSync(caminho)) {
        fs.writeFileSync(caminho, '[]', 'utf8');
    }
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
}


function salvarJSON(caminho, dados) {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf8');
}

// === Carregamento inicial dos dados ===
// Carrega os dados salvos anteriormente, se existirem
let musicas = lerJSON(caminhoMusicas);
let playlists = lerJSON(caminhoPlaylists);

// Exibe o título inicial do programa
console.log("=== 🎵 Gerenciador de Músicas ===");
menu(); // Inicia o menu principal

// === Função principal do menu ===
async function menu() {
    while (true) { // Loop infinito até o usuário escolher "Sair"
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

        // Escolhe a ação com base na opção selecionada
        switch (opcao) {
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
                // Ao sair, limpa o console e salva os dados antes de encerrar o programa
                limparConsole();
                console.log("💾 Salvando dados...");
                salvarJSON(caminhoMusicas, musicas);
                salvarJSON(caminhoPlaylists, playlists);
                console.log("👋 Até a próxima!");
                process.exit(); // Encerra o programa
        }
    }
}

// === Função de limpar o console ===
// Apenas limpa a tela do terminal
function limparConsole() {
    console.clear();
}

// === Funções auxiliares ===
// Gera um novo ID automaticamente com base no último item da lista
function gerarId(array) {
    return array.length > 0 ? array[array.length - 1].id + 1 : 1;
}

// === CRUD de Músicas e Playlists ===

// Função para cadastrar uma nova música
async function cadastrarMusica() {
    // Permite escolher entre cadastrar ou voltar ao menu
    const opcao = await select({
        message: "Deseja cadastrar uma nova música ou voltar?",
        choices: [
            { name: "Cadastrar nova música", value: "continuar" },
            { name: "Voltar", value: "voltar" }
        ]
    });
    if (opcao === "voltar") return; // Retorna ao menu principal

    // Coleta os dados da nova música
    const titulo = await input({ message: "Nome da música:" });
    const artista = await input({ message: "Artista:" });
    const album = await input({ message: "Álbum:" });
    const genero = await input({ message: "Gênero:" });
    const duracao = parseInt(await input({ message: "Duração:" }));
    const ano = parseInt(await input({ message: "Ano de lançamento:" }));

    // Cria o objeto da nova música
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
        dataAdicao: new Date().toISOString().split('T')[0] // Data atual
    };

    // Adiciona à lista e salva no arquivo JSON
    musicas.push(musica);
    salvarJSON(caminhoMusicas, musicas);
    console.log("✅ Música cadastrada com sucesso!");
}

// Cria uma nova playlist
async function criarPlaylist() {
    const opcao = await select({
        message: "Deseja criar uma nova playlist ou voltar?",
        choices: [
            { name: "Criar nova playlist", value: "continuar" },
            { name: "Voltar", value: "voltar" }
        ]
    });
    if (opcao === "voltar") return;

    // Pede nome e descrição da playlist
    const nome = await input({ message: "Nome da playlist:" });
    const descricao = await input({ message: "Descrição:" });

    // Cria o objeto da playlist
    const playlist = {
        id: gerarId(playlists),
        nome,
        descricao,
        musicas: [],
        dataCriacao: new Date().toISOString().split('T')[0]
    };

    // Adiciona e salva
    playlists.push(playlist);
    salvarJSON(caminhoPlaylists, playlists);
    console.log("✅ Playlist criada com sucesso!");
}

// Adiciona uma música a uma playlist existente
async function adicionarMusicaPlaylist() {
    if (playlists.length === 0 || musicas.length === 0) {
        console.log("⚠️  Cadastre pelo menos uma música e uma playlist primeiro!");
        return;
    }

    const opcao = await select({
        message: "Deseja adicionar uma música ou voltar?",
        choices: [
            { name: "Adicionar música", value: "continuar" },
            { name: "Voltar", value: "voltar" }
        ]
    });
    if (opcao === "voltar") return;

    // Seleciona a playlist
    const playlistEscolhida = await select({
        message: "Selecione a playlist:",
        choices: playlists.map(p => ({ name: p.nome, value: p.id }))
    });

    // Seleciona a música
    const musicaEscolhida = await select({
        message: "Selecione a música para adicionar:",
        choices: musicas.map(m => ({ name: `${m.titulo} - ${m.artista}`, value: m.id }))
    });

    // Adiciona a música à playlist e salva
    const playlist = playlists.find(p => p.id === playlistEscolhida);
    playlist.musicas.push(musicaEscolhida);
    salvarJSON(caminhoPlaylists, playlists);
    console.log("✅ Música adicionada à playlist!");
}

// Marca uma música como favorita
async function marcarFavorita() {
    if (musicas.length === 0) return console.log("⚠️ Nenhuma música cadastrada.");

    const opcao = await select({
        message: "Deseja marcar uma favorita ou voltar?",
        choices: [
            { name: "Marcar favorita", value: "continuar" },
            { name: "Voltar", value: "voltar" }
        ]
    });
    if (opcao === "voltar") return;

    // Seleciona qual música será marcada
    const musicaEscolhida = await select({
        message: "Selecione a música:",
        choices: musicas.map(m => ({ name: `${m.titulo} - ${m.artista}`, value: m.id }))
    });

    const musica = musicas.find(m => m.id === musicaEscolhida);
    musica.favorita = true;
    salvarJSON(caminhoMusicas, musicas);
    console.log("⭐ Música marcada como favorita!");
}

// Permite avaliar uma música com nota de 1 a 5
async function avaliarMusica() {
    if (musicas.length === 0) return console.log("⚠️ Nenhuma música cadastrada.");

    const opcao = await select({
        message: "Deseja avaliar uma música ou voltar?",
        choices: [
            { name: "Avaliar música", value: "continuar" },
            { name: "Voltar", value: "voltar" }
        ]
    });
    if (opcao === "voltar") return;

    const musicaEscolhida = await select({
        message: "Selecione a música para avaliar:",
        choices: musicas.map(m => ({ name: `${m.titulo} - ${m.artista}`, value: m.id }))
    });

    const avaliacao = parseInt(await input({ message: "Avaliação (1-5):" }));
    if (avaliacao < 1 || avaliacao > 5) return console.log("❌ Avaliação inválida!");

    const musica = musicas.find(m => m.id === musicaEscolhida);
    musica.avaliacao = avaliacao;
    salvarJSON(caminhoMusicas, musicas);
    console.log("✅ Música avaliada!");
}

// === Estatísticas ===

// Calcula qual gênero aparece mais nas músicas
function generoFavorito() {
    const contador = {};
    musicas.forEach(m => contador[m.genero] = (contador[m.genero] || 0) + 1);
    const favorito = Object.keys(contador).reduce((a, b) => contador[a] > contador[b] ? a : b, null);
    return favorito || "Nenhum";
}

// Descobre qual artista tem mais músicas cadastradas
function artistaMaisOuvido() {
    const contador = {};
    musicas.forEach(m => contador[m.artista] = (contador[m.artista] || 0) + 1);
    const favorito = Object.keys(contador).reduce((a, b) => contador[a] > contador[b] ? a : b, null);
    return favorito || "Nenhum";
}

// Lista as músicas adicionadas recentemente (nos últimos N dias)
function musicasRecentes(dias = 7) {
    const hoje = new Date();
    return musicas.filter(m => {
        const dataAdicao = new Date(m.dataAdicao);
        return (hoje - dataAdicao) / (1000 * 60 * 60 * 24) <= dias;
    });
}

// === Visualização ===
// Exibe músicas e playlists em formato de tabela no console
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
