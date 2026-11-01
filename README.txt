COLETOR DM + EVS V1.1
Substitua no repositorio GitHub Pages os arquivos index.html, app.js, sw.js, manifest.webmanifest e icon.svg.
O armazenamento utiliza a mesma chave da V1.0 no mesmo dominio e caminho. Exporte CSV antes da atualizacao por seguranca.
OCR continuo via Tesseract.js: processa somente a moldura, sequencialmente; depende do desempenho do aparelho e pode precisar de internet para carregar OCR.
O usuario deve confirmar a TAG. Nao ha atualizacao automatica das planilhas oficiais.

V1.2: abertura da camera corrigida; area de video exibida antes do play; fallback de camera e mensagens de permissao; cache versionado.

V1.3: botoes animados, confirmacao de baixa, historico editavel/exclusao logica, compartilhamento CSV via Web Share API, OCR com ultimo resultado, campo obra removido. Camera alternativa por foto.

V1.4: pré-carregamento OCR ao abrir, botões de sinetes recentes, último sinete mantido, vibração e bipe (quando suportados), reconhecimento sem diálogo de confirmação. OCR ainda usa recursos remotos na primeira preparação: NÃO está empacotado/offline integral.
