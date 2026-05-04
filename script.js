a
const STORAGE_KEY = "entregaok_entregas_premium_v1";
const DRIVER_KEY = "entregaok_driver_name_v1";

let entregas = [];
let entregaFotoAtual = null;
let fechamentoAtual = null;

const $ = (id) => document.getElementById(id);

const welcomeScreen = $("welcomeScreen");
const welcomeForm = $("welcomeForm");
const driverNameInput = $("driverNameInput");
const appShell = $("appShell");

const formPanel = $("formPanel");
const deliveryForm = $("deliveryForm");
const navRapido = $("navRapido");
const nomeInput = $("nome");
const valorInput = $("valor");
const buscaInput = $("busca");

const listaEntregas = $("listaEntregas");
const emptyState = $("emptyState");

const totalEntregue = $("totalEntregue");
const totalPendente = $("totalPendente");
const qtdEntregue = $("qtdEntregue");
const qtdPendente = $("qtdPendente");
const contadorEntregas = $("contadorEntregas");
const driverGreeting = $("driverGreeting");

const photoModal = $("photoModal");
const photoInput = $("photoInput");
const toast = $("toast");

const closeScreen = $("closeScreen");
const closeTitle = $("closeTitle");
const closeSubtitle = $("closeSubtitle");
const closeTotalEntregue = $("closeTotalEntregue");
const closeTotalGeral = $("closeTotalGeral");
const closeTotalPendente = $("closeTotalPendente");
const closeQtdTotal = $("closeQtdTotal");
const closeQtdFinalizadas = $("closeQtdFinalizadas");
const closeQtdPendentes = $("closeQtdPendentes");
const closeDriverName = $("closeDriverName");

function iniciarApp() {
  carregarEntregas();
  registrarEventos();
  verificarEntregador();
  renderizar();
}

function registrarEventos() {
  welcomeForm.addEventListener("submit", salvarEntregadorInicial);

  $("btnEditDriver").addEventListener("click", editarEntregador);

  $("btnNovaEntrega").addEventListener("click", abrirForm);
  $("floatingAdd").addEventListener("click", abrirForm);
  $("btnFecharForm").addEventListener("click", fecharForm);
  $("btnEmptyNova").addEventListener("click", abrirForm);

  $("navHoje").addEventListener("click", voltarParaHoje);
  $("navFechar").addEventListener("click", abrirFechamentoPremium);

  $("btnFecharDia").addEventListener("click", abrirFechamentoPremium);
  $("btnLimparDia").addEventListener("click", limparDia);
  $("navRapido").addEventListener("click", alternarModoRapido);

  deliveryForm.addEventListener("submit", criarEntrega);
  buscaInput.addEventListener("input", renderizar);

  $("btnClosePhoto").addEventListener("click", fecharModalFoto);
  $("btnTakePhoto").addEventListener("click", () => photoInput.click());
  $("btnRemovePhoto").addEventListener("click", removerFoto);

  photoInput.addEventListener("change", salvarFoto);

  photoModal.addEventListener("click", (event) => {
    if (event.target === photoModal) fecharModalFoto();
  });

  $("btnCloseSummary").addEventListener("click", fecharFechamentoPremium);
  $("btnBackToApp").addEventListener("click", fecharFechamentoPremium);
  $("btnDownloadClose").addEventListener("click", baixarFechamentoAtual);

  closeScreen.addEventListener("click", (event) => {
    if (event.target === closeScreen) fecharFechamentoPremium();
  });

  document.addEventListener("keydown", atalhos);
}

function alternarModoRapido() {
  const ativo = document.body.classList.contains("modo-rapido");

  if (ativo) {
    // DESATIVAR
    document.body.classList.remove("modo-rapido");
    navRapido.classList.remove("active-quick");

    fecharForm();
    mostrarToast("Modo normal");

  } else {
    // ATIVAR
    document.body.classList.add("modo-rapido");
    navRapido.classList.add("active-quick");

    abrirForm();
    nomeInput.focus();

    mostrarToast("Modo rápido ativado ⚡");
    vibrarLeve();
  }
}

function verificarEntregador() {
  const nome = pegarNomeEntregador();

  if (!nome) {
    welcomeScreen.classList.add("active");
    document.body.classList.add("no-scroll");

    setTimeout(() => {
      driverNameInput.focus();
    }, 250);

    return;
  }

  atualizarNomeEntregadorNaTela();
}

function salvarEntregadorInicial(event) {
  event.preventDefault();

  const nome = driverNameInput.value.trim();

  if (!nome) {
    mostrarToast("Digite o nome do entregador");
    return;
  }

  localStorage.setItem(DRIVER_KEY, nome);

  welcomeScreen.classList.remove("active");
  document.body.classList.remove("no-scroll");

  atualizarNomeEntregadorNaTela();
  mostrarToast(`Bem-vindo, ${nome}`);
}

function editarEntregador() {
  const atual = pegarNomeEntregador() || "";
  const novo = prompt("Nome do entregador:", atual);

  if (novo === null) return;

  const nomeLimpo = novo.trim();

  if (!nomeLimpo) {
    mostrarToast("Nome inválido");
    return;
  }

  localStorage.setItem(DRIVER_KEY, nomeLimpo);
  atualizarNomeEntregadorNaTela();
  mostrarToast("Entregador atualizado");
}

function pegarNomeEntregador() {
  return localStorage.getItem(DRIVER_KEY) || "";
}

function atualizarNomeEntregadorNaTela() {
  const nome = pegarNomeEntregador();

  if (!nome) {
    driverGreeting.textContent = "Bom trabalho";
    return;
  }

  driverGreeting.textContent = `${saudacaoDoDia()}, ${nome}`;
}

function saudacaoDoDia() {
  const hora = new Date().getHours();

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function abrirForm() {
  formPanel.classList.add("active");

  setTimeout(() => {
    nomeInput.focus();
  }, 120);

  atualizarNavAtiva("navNova");
}

function fecharForm() {
  formPanel.classList.remove("active");
  limparCampos();
  atualizarNavAtiva("navHoje");
}

function voltarParaHoje() {
  fecharForm();
  fecharFechamentoPremium();

  const coluna = document.querySelector(".deliveries-column");

  if (coluna) {
    coluna.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  atualizarNavAtiva("navHoje");
}

function atualizarNavAtiva(id) {
  document.querySelectorAll(".bottom-btn").forEach((botao) => {
    botao.classList.remove("active");
  });

  const ativo = $(id);

  if (ativo) {
    ativo.classList.add("active");
  }

  const navRapido = $("navRapido");

  if (navRapido && document.body.classList.contains("modo-rapido")) {
    navRapido.classList.add("active-quick");
  }
}

function limparCampos() {
  nomeInput.value = "";
  valorInput.value = "";
}

function criarEntrega(event) {
  event.preventDefault();

  const nome = nomeInput.value.trim();
  const valor = converterValor(valorInput.value);

  if (!nome) {
    mostrarToast("Digite o nome do cliente");
    return;
  }

  if (!valor || valor <= 0) {
    mostrarToast("Digite um valor válido");
    return;
  }

  const entrega = {
    id: criarId(),
    nome,
    valor,
    status: "pendente",
    foto: null,
    criadoEm: Date.now(),
    horarioSaida: pegarHora(),
    horarioEntrega: null,
    dia: pegarDiaAtual(),
    entregador: pegarNomeEntregador()
  };

  entregas.unshift(entrega);

  salvarEntregas();
  renderizar();
  limparCampos();
  fecharForm();

  mostrarToast("Entrega salva");

  setTimeout(() => {
    const primeiroCard = document.querySelector(".delivery-card");
    if (primeiroCard) {
      primeiroCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, 100);
}

function renderizar() {
  const busca = buscaInput.value.trim().toLowerCase();
  const diaAtual = pegarDiaAtual();

  const entregasHoje = entregas.filter((entrega) => entrega.dia === diaAtual);

  const filtradas = entregasHoje.filter((entrega) => {
    return entrega.nome.toLowerCase().includes(busca);
  });

  renderizarResumo(entregasHoje);
  renderizarLista(filtradas, entregasHoje.length);
}

function renderizarResumo(lista) {
  const entregues = lista.filter((item) => item.status === "entregue");
  const pendentes = lista.filter((item) => item.status === "pendente");

  const somaEntregue = entregues.reduce((total, item) => total + item.valor, 0);
  const somaPendente = pendentes.reduce((total, item) => total + item.valor, 0);

  totalEntregue.textContent = formatarDinheiro(somaEntregue);
  totalPendente.textContent = formatarDinheiro(somaPendente);

  qtdEntregue.textContent = `${entregues.length} finalizadas`;
  qtdPendente.textContent = `${pendentes.length} pendentes`;

  contadorEntregas.textContent = `${lista.length} entregas`;
}

function renderizarLista(lista, totalHoje) {
  listaEntregas.innerHTML = "";

  if (totalHoje === 0) {
    emptyState.style.display = "grid";
    listaEntregas.appendChild(emptyState);
    return;
  }

  emptyState.style.display = "none";

  if (lista.length === 0) {
    const vazioBusca = document.createElement("div");
    vazioBusca.className = "empty-state";
    vazioBusca.innerHTML = `
      <div>
        <div class="empty-icon">⌕</div>
        <h2>Nada encontrado</h2>
        <p>Nenhuma entrega combina com essa busca.</p>
      </div>
    `;

    listaEntregas.appendChild(vazioBusca);
    return;
  }

  lista.forEach((entrega) => {
    const card = criarCardEntrega(entrega);
    listaEntregas.appendChild(card);
  });
}

function criarCardEntrega(entrega) {
  const card = document.createElement("article");
  const entregue = entrega.status === "entregue";

  card.className = `delivery-card ${entregue ? "done" : ""}`;

  card.innerHTML = `
    <div class="delivery-top">
      <div>
        <h3 class="delivery-name">${escaparHTML(entrega.nome)}</h3>

        <p class="delivery-meta">
          saiu ${entrega.horarioSaida}
          ${entrega.horarioEntrega ? `• entregue ${entrega.horarioEntrega}` : ""}
        </p>
      </div>

      <div>
        <p class="delivery-value">${formatarDinheiro(entrega.valor)}</p>

        <span class="status-pill ${entregue ? "done" : ""}">
          ${entregue ? "entregue" : "na rua"}
        </span>
      </div>
    </div>

    ${
      entrega.foto
        ? `<img class="delivery-photo" src="${entrega.foto}" alt="Foto do pedido">`
        : ""
    }

    <div class="delivery-actions">
      <button class="${entregue ? "btn-secondary" : "btn-delivered"}" onclick="alternarStatus('${entrega.id}')">
        ${entregue ? "Voltar para na rua" : "Marcar entregue"}
      </button>

      <button class="btn-secondary" onclick="abrirModalFoto('${entrega.id}')" title="Foto do pedido">
        📸
      </button>

      <button class="btn-delete" onclick="apagarEntrega('${entrega.id}')" title="Apagar">
        🗑
      </button>
    </div>
  `;

  return card;
}

function alternarStatus(id) {
  const entrega = entregas.find((item) => item.id === id);

  if (!entrega) return;

  if (entrega.status === "pendente") {
    entrega.status = "entregue";
    entrega.horarioEntrega = pegarHora();
    vibrarLeve();
    mostrarToast("Entrega finalizada");
  } else {
    entrega.status = "pendente";
    entrega.horarioEntrega = null;
    mostrarToast("Voltou para na rua");
  }

  salvarEntregas();
  renderizar();
}

function apagarEntrega(id) {
  const entrega = entregas.find((item) => item.id === id);
  const nome = entrega ? entrega.nome : "essa entrega";

  const confirmar = confirm(`Apagar ${nome}?`);

  if (!confirmar) return;

  entregas = entregas.filter((item) => item.id !== id);

  salvarEntregas();
  renderizar();
  mostrarToast("Entrega apagada");
}

function abrirModalFoto(id) {
  entregaFotoAtual = id;
  photoModal.classList.add("active");
  document.body.classList.add("no-scroll");
}

function fecharModalFoto() {
  entregaFotoAtual = null;
  photoModal.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

function salvarFoto(event) {
  const arquivo = event.target.files[0];

  if (!arquivo || !entregaFotoAtual) return;

  if (!arquivo.type.startsWith("image/")) {
    mostrarToast("Arquivo inválido");
    return;
  }

  mostrarToast("Processando foto...");

  const leitor = new FileReader();

  leitor.onload = () => {
    const imagemOriginal = leitor.result;

    reduzirImagem(imagemOriginal, 900, 0.78, (imagemReduzida) => {
      entregas = entregas.map((item) => {
        if (item.id === entregaFotoAtual) {
          return {
            ...item,
            foto: imagemReduzida
          };
        }

        return item;
      });

      salvarEntregas();
      renderizar();
      fecharModalFoto();

      photoInput.value = "";

      mostrarToast("Foto salva");
    });
  };

  leitor.readAsDataURL(arquivo);
}

function removerFoto() {
  if (!entregaFotoAtual) return;

  const entrega = entregas.find((item) => item.id === entregaFotoAtual);

  if (!entrega || !entrega.foto) {
    mostrarToast("Essa entrega não tem foto");
    return;
  }

  entregas = entregas.map((item) => {
    if (item.id === entregaFotoAtual) {
      return {
        ...item,
        foto: null
      };
    }

    return item;
  });

  salvarEntregas();
  renderizar();
  fecharModalFoto();

  mostrarToast("Foto removida");
}

function reduzirImagem(base64, larguraMaxima, qualidade, callback) {
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");

    let largura = img.width;
    let altura = img.height;

    if (largura > larguraMaxima) {
      altura = Math.round((altura * larguraMaxima) / largura);
      largura = larguraMaxima;
    }

    canvas.width = largura;
    canvas.height = altura;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, largura, altura);

    const imagemFinal = canvas.toDataURL("image/jpeg", qualidade);

    callback(imagemFinal);
  };

  img.src = base64;
}

function abrirFechamentoPremium() {
  const resumo = gerarResumoDoDia();

  if (resumo.entregasHoje.length === 0) {
    mostrarToast("Nenhuma entrega hoje");
    return;
  }

  fechamentoAtual = resumo;

  closeTitle.textContent = criarTituloFechamento(resumo);
  closeSubtitle.textContent = criarSubtituloFechamento(resumo);

  closeTotalEntregue.textContent = formatarDinheiro(resumo.totalEntregue);
  closeTotalGeral.textContent = formatarDinheiro(resumo.totalGeral);
  closeTotalPendente.textContent = formatarDinheiro(resumo.totalPendente);

  closeQtdTotal.textContent = resumo.qtdTotal;
  closeQtdFinalizadas.textContent = resumo.qtdFinalizadas;
  closeQtdPendentes.textContent = resumo.qtdPendentes;

  closeDriverName.textContent = resumo.entregador || "-";

  closeScreen.classList.add("active");
  document.body.classList.add("no-scroll");

  atualizarNavAtiva("navFechar");
  vibrarLeve();
}

function fecharFechamentoPremium() {
  closeScreen.classList.remove("active");
  document.body.classList.remove("no-scroll");
  atualizarNavAtiva("navHoje");
}

function criarTituloFechamento(resumo) {
  const nome = resumo.entregador ? resumo.entregador.split(" ")[0] : "entregador";

  if (resumo.qtdPendentes === 0) {
    return `Parabéns, ${nome}. Dia fechado com sucesso.`;
  }

  return `${nome}, fechamento gerado. Ainda há entregas na rua.`;
}

function criarSubtituloFechamento(resumo) {
  if (resumo.qtdPendentes === 0) {
    return `Você finalizou ${resumo.qtdFinalizadas} entregas hoje. Resumo pronto para conferência e download.`;
  }

  return `Foram ${resumo.qtdFinalizadas} entregas finalizadas e ${resumo.qtdPendentes} ainda pendentes. Confira antes de encerrar.`;
}

function gerarResumoDoDia() {
  const diaAtual = pegarDiaAtual();
  const entregasHoje = entregas.filter((item) => item.dia === diaAtual);

  const entregues = entregasHoje.filter((item) => item.status === "entregue");
  const pendentes = entregasHoje.filter((item) => item.status === "pendente");

  const totalEntregueValor = entregues.reduce((total, item) => total + item.valor, 0);
  const totalPendenteValor = pendentes.reduce((total, item) => total + item.valor, 0);
  const totalGeralValor = entregasHoje.reduce((total, item) => total + item.valor, 0);

  return {
    dia: diaAtual,
    dataFormatada: new Date().toLocaleDateString("pt-BR"),
    horaFormatada: pegarHora(),
    entregador: pegarNomeEntregador(),
    entregasHoje,
    entregues,
    pendentes,
    qtdTotal: entregasHoje.length,
    qtdFinalizadas: entregues.length,
    qtdPendentes: pendentes.length,
    totalEntregue: totalEntregueValor,
    totalPendente: totalPendenteValor,
    totalGeral: totalGeralValor
  };
}

function baixarFechamentoAtual() {
  if (!fechamentoAtual) {
    fechamentoAtual = gerarResumoDoDia();
  }

  if (!fechamentoAtual.entregasHoje.length) {
    mostrarToast("Nenhuma entrega para baixar");
    return;
  }

  const texto = gerarTextoFechamento(fechamentoAtual);
  const nomeArquivo = `fechamento-entregaok-${fechamentoAtual.dia}.txt`;

  baixarArquivo(nomeArquivo, texto);
  mostrarToast("Fechamento baixado");
}

function gerarTextoFechamento(resumo) {
  let texto = "";

  texto += "=====================================\n";
  texto += "ENTREGAOK - FECHAMENTO DO DIA\n";
  texto += "=====================================\n\n";

  texto += `Data: ${resumo.dataFormatada}\n`;
  texto += `Horário: ${resumo.horaFormatada}\n`;
  texto += `Entregador: ${resumo.entregador || "-"}\n\n`;

  texto += "RESUMO\n";
  texto += "-------------------------------------\n";
  texto += `Total geral: ${formatarDinheiro(resumo.totalGeral)}\n`;
  texto += `Total entregue: ${formatarDinheiro(resumo.totalEntregue)}\n`;
  texto += `Total pendente: ${formatarDinheiro(resumo.totalPendente)}\n`;
  texto += `Entregas registradas: ${resumo.qtdTotal}\n`;
  texto += `Finalizadas: ${resumo.qtdFinalizadas}\n`;
  texto += `Pendentes: ${resumo.qtdPendentes}\n\n`;

  texto += "LISTA DE ENTREGAS\n";
  texto += "-------------------------------------\n\n";

  resumo.entregasHoje
    .slice()
    .reverse()
    .forEach((item, index) => {
      texto += `${index + 1}. ${item.nome}\n`;
      texto += `Valor: ${formatarDinheiro(item.valor)}\n`;
      texto += `Status: ${item.status === "entregue" ? "Entregue" : "Na rua"}\n`;
      texto += `Saiu: ${item.horarioSaida}\n`;
      texto += `Entregue: ${item.horarioEntrega || "-"}\n`;
      texto += `Foto: ${item.foto ? "Sim" : "Não"}\n`;
      texto += "\n";
    });

  texto += "=====================================\n";
  texto += "Gerado pelo EntregaOK\n";
  texto += "=====================================\n";

  return texto;
}

function limparDia() {
  const resumo = gerarResumoDoDia();

  if (resumo.qtdTotal === 0) {
    mostrarToast("Nenhuma entrega hoje");
    return;
  }

  const confirmar = confirm(
    `Limpar ${resumo.qtdTotal} entregas de hoje?\n\nAntes de limpar, baixe o fechamento se precisar guardar.`
  );

  if (!confirmar) return;

  entregas = entregas.filter((item) => item.dia !== resumo.dia);

  salvarEntregas();
  renderizar();

  mostrarToast("Dia limpo");
}

function carregarEntregas() {
  const salvas = localStorage.getItem(STORAGE_KEY);

  if (!salvas) {
    entregas = [];
    return;
  }

  try {
    entregas = JSON.parse(salvas);

    if (!Array.isArray(entregas)) {
      entregas = [];
    }
  } catch (error) {
    entregas = [];
    console.error("Erro ao carregar entregas:", error);
  }
}

function salvarEntregas() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entregas));
  } catch (error) {
    console.error("Erro ao salvar:", error);
    mostrarToast("Memória cheia. Remova fotos antigas.");
  }
}

function converterValor(valor) {
  if (!valor) return 0;

  const limpo = String(valor)
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(limpo);

  if (Number.isNaN(numero)) return 0;

  return numero;
}

function formatarDinheiro(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor || 0);
}

function pegarHora() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function pegarDiaAtual() {
  const data = new Date();

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function criarId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function baixarArquivo(nomeArquivo, conteudo) {
  const blob = new Blob([conteudo], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = nomeArquivo;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add("active");

  clearTimeout(mostrarToast.timer);

  mostrarToast.timer = setTimeout(() => {
    toast.classList.remove("active");
  }, 2200);
}

function vibrarLeve() {
  if ("vibrate" in navigator) {
    navigator.vibrate(35);
  }
}

function atalhos(event) {
  const tag = document.activeElement.tagName;
  const digitando = ["INPUT", "TEXTAREA"].includes(tag);

  if (event.key === "Escape") {
    fecharForm();
    fecharModalFoto();
    fecharFechamentoPremium();
  }

  if (!digitando && event.key.toLowerCase() === "n") {
    abrirForm();
  }

  if (!digitando && event.key.toLowerCase() === "f") {
    abrirFechamentoPremium();
  }
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function alternarModoRapido() {
  const navRapido = $("navRapido");
  const ativo = document.body.classList.contains("modo-rapido");

  if (ativo) {
    document.body.classList.remove("modo-rapido");
    navRapido.classList.remove("active-quick");
    fecharForm();
    atualizarNavAtiva("navHoje");
    mostrarToast("Modo normal");
    return;
  }

  document.body.classList.add("modo-rapido");
  navRapido.classList.add("active-quick");
  formPanel.classList.add("active");

  setTimeout(() => {
    nomeInput.focus();
  }, 120);

  mostrarToast("Modo rápido ativado ⚡");
  vibrarLeve();
}


window.alternarStatus = alternarStatus;
window.apagarEntrega = apagarEntrega;
window.abrirModalFoto = abrirModalFoto;

iniciarApp();
