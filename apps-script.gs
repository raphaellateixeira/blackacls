/**
 * Recebe os leads da página de captura e grava na planilha.
 * Escreve pelo NOME DA COLUNA (linha 1), então você pode adicionar,
 * remover ou reordenar colunas sem precisar mexer neste código.
 *
 * Projeto: Black ACLS 2026, Prof. Marco Campos.
 * Aba esperada: black_acls_2026 (crie a aba com esse nome exato antes de publicar).
 * As duas versoes da pagina gravam na mesma aba; a coluna url diz qual delas trouxe o lead.
 */

// aceita variações de nome de cabeçalho
var MAPA = {
  'data': 'data', 'datahora': 'data', 'dataehora': 'data',
  'nome': 'nome',
  'email': 'email', 'emeil': 'email',
  'phone': 'telefone', 'telefone': 'telefone', 'whatsapp': 'telefone', 'celular': 'telefone',
  'url': 'pagina', 'pagina': 'pagina', 'página': 'pagina',
  'src': 'src',
  'utmsource': 'utm_source', 'utmmedium': 'utm_medium', 'utmcampaign': 'utm_campaign',
  'utmcontent': 'utm_content', 'utmterm': 'utm_term', 'utmcampaignid': 'utm_campaign_id',
  'fbclid': 'fbclid', 'gclid': 'gclid',
  'eventid': 'event_id', 'idevento': 'event_id'
};

function normaliza(txt) {
  return String(txt)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // tira acento
    .replace(/[^a-z0-9]/g, '');                        // tira _ - espaço
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);                       // evita dois leads gravando na mesma linha
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dados = JSON.parse(e.postData.contents);
    // as paginas da Black mandam aba: 'black_acls_2026'; sem essa aba o lead cai na primeira
    var aba = (dados.aba && ss.getSheetByName(dados.aba)) || ss.getSheets()[0];
    if (aba.getLastColumn() === 0) {
      aba.appendRow(['Data','Nome','Email','phone','utm_source','utm_medium','utm_campaign',
        'utm_content','utm_term','url','src','utm_campaign_id','fbclid','event_id']);
    }

    if (!dados.data) {
      dados.data = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
    }

    var cabecalhos = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
    var linha = cabecalhos.map(function (titulo) {
      var chave = MAPA[normaliza(titulo)] || normaliza(titulo);
      return dados[chave] !== undefined ? dados[chave] : '';
    });

    aba.appendRow(linha);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    // registra o erro numa aba separada em vez de perder o lead
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var log = ss.getSheetByName('erros') || ss.insertSheet('erros');
      log.appendRow([new Date(), String(err), e && e.postData ? e.postData.contents : '']);
    } catch (e2) {}
    return ContentService.createTextOutput('erro: ' + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('webhook ativo');
}
