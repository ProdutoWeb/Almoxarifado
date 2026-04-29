-- =============================================================================
-- Migration: Atualização dos códigos SIE dos produtos
-- Fonte: lista_almoxarifado_-_atualizada_em_julho_2025_-_sem_material_hospitalar.docx.pdf
-- Data de geração: 2026-04-29
-- =============================================================================

-- 1. Garantir que a coluna 'codigo' existe
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS codigo TEXT;

-- 2. Definir valor padrão para TODOS os produtos existentes.
--    Produtos sem correspondência no PDF serão identificados por este valor.
UPDATE public.produtos SET codigo = 'TEMP_SEM_CODIGO';

-- =============================================================================
-- 3. Atualizar códigos dos produtos com base no PDF oficial da UFES
-- =============================================================================

-- =============================================
-- MATERIAL DE EXPEDIENTE
-- =============================================

-- 2057 - Apagador para quadro branco
UPDATE public.produtos SET codigo = '2057' WHERE nome ILIKE '%apagador%quadro%';

-- 2060 - Apontador escolar plástico
UPDATE public.produtos SET codigo = '2060' WHERE nome ILIKE '%apontador%';

-- 846 - Bloco de papel para recado/lembrete, auto-adesivo, cor amarela
UPDATE public.produtos SET codigo = '846' WHERE nome ILIKE '%bloco%recado%';

-- 188 - Borracha branca para apagar escrita a lápis
UPDATE public.produtos SET codigo = '188' WHERE nome ILIKE '%borracha%branca%';

-- 200 - Caixa para arquivo morto, em plástico; cor amarela
UPDATE public.produtos SET codigo = '200' WHERE nome ILIKE '%caixa%arquivo%morto%';

-- 225 - Caneta esferográfica azul, escrita grossa
UPDATE public.produtos SET codigo = '225' WHERE nome ILIKE '%caneta%esferogr%fica%azul%';

-- 226 - Caneta esferográfica preta, escrita grossa
UPDATE public.produtos SET codigo = '226' WHERE nome ILIKE '%caneta%esferogr%fica%preta%';

-- 227 - Caneta esferográfica vermelha, escrita grossa
UPDATE public.produtos SET codigo = '227' WHERE nome ILIKE '%caneta%esferogr%fica%vermelha%';

-- 233 - Caneta hidrográfica marca texto; cor: amarela fluorescente
UPDATE public.produtos SET codigo = '233' WHERE nome ILIKE '%marca%texto%amarela%';

-- 235 - Caneta hidrográfica marca texto; cor: verde fluorescente
UPDATE public.produtos SET codigo = '235' WHERE nome ILIKE '%marca%texto%verde%';

-- 320339 - Capa de processo, pasta 49cm x 33cm
UPDATE public.produtos SET codigo = '320339' WHERE nome ILIKE '%capa%processo%';

-- 297 - Clips nº 2/0 (00) em aço niquelado, caixa com 100 unidades
UPDATE public.produtos SET codigo = '297' WHERE nome ILIKE '%clips%2/0%' OR nome ILIKE '%clips%00%';

-- 299 - Clips niquelado; tamanho nº 6/0, caixa com 50 unidades
UPDATE public.produtos SET codigo = '299' WHERE nome ILIKE '%clips%6/0%';

-- 307 - Cola branca, tubo com 40 gramas
UPDATE public.produtos SET codigo = '307' WHERE nome ILIKE '%cola%branca%';

-- 361 - Envelope branco para correspondência, 114 x 229 mm
UPDATE public.produtos SET codigo = '361' WHERE nome ILIKE '%envelope%branco%';

-- 362 - Envelope kraft liso, 370 x 265 mm
UPDATE public.produtos SET codigo = '362' WHERE nome ILIKE '%envelope%kraft%';

-- 436 - Fita adesiva crepe bege, 19 mm x 50 m
UPDATE public.produtos SET codigo = '436' WHERE nome ILIKE '%fita%crepe%';

-- 431 - Fita adesiva transparente, 12mm x 30m (pequena)
UPDATE public.produtos SET codigo = '431' WHERE nome ILIKE '%fita%adesiva%transparente%12mm%' OR nome ILIKE '%fita%adesiva%transparente%pequena%';

-- 453 - Fita adesiva transparente para embalagem, 45mm x 50m
UPDATE public.produtos SET codigo = '453' WHERE nome ILIKE '%fita%adesiva%transparente%45mm%' OR nome ILIKE '%fita%adesiva%transparente%embalagem%';

-- 18785 - Grampeador de papel médio (15 a 20 cm)
UPDATE public.produtos SET codigo = '18785' WHERE nome ILIKE '%grampeador%';

-- 490 - Grampo para grampeador, 26 x 6, arame cobreado
UPDATE public.produtos SET codigo = '490' WHERE nome ILIKE '%grampo%26%' OR nome ILIKE '%grampo%grampeador%';

-- 491 - Grampo plástico com trilho para pasta intercaladora
UPDATE public.produtos SET codigo = '491' WHERE nome ILIKE '%grampo%pl%stico%' OR nome ILIKE '%grampo%trilho%';

-- 900 - Impresso "ufes" g-050 papel informação
UPDATE public.produtos SET codigo = '900' WHERE nome ILIKE '%impresso%ufes%';

-- 523 - Lápis n. 02, grafite preto
UPDATE public.produtos SET codigo = '523' WHERE nome ILIKE '%l%pis%02%' OR nome ILIKE '%l%pis%n%2%';

-- 18787 - Livro protocolo de correspondência, capa dura
UPDATE public.produtos SET codigo = '18787' WHERE nome ILIKE '%livro%protocolo%';

-- 322809 - Papel almaço pautado com margem, pacote com 50 folhas
UPDATE public.produtos SET codigo = '322809' WHERE nome ILIKE '%papel%alma%o%';

-- 654 - Papel reciclado, fibras renováveis e recicladas, tipo A4
UPDATE public.produtos SET codigo = '654' WHERE nome ILIKE '%papel%reciclado%';

-- 681 - Pasta classificadora a-z ofício, lombo largo
UPDATE public.produtos SET codigo = '681' WHERE nome ILIKE '%pasta%classificadora%';

-- 688 - Pasta suspensa com visor plástico completo e prendedor
UPDATE public.produtos SET codigo = '688' WHERE nome ILIKE '%pasta%suspensa%';

-- 566 - Papel sulfite branco alcalino, Tipo A4, 75g/m²
UPDATE public.produtos SET codigo = '566' WHERE nome ILIKE '%papel%sulfite%';

-- 7340 - Pilha, modelo AA (pequena), alcalina
UPDATE public.produtos SET codigo = '7340' WHERE nome ILIKE '%pilha%aa%' AND nome NOT ILIKE '%aaa%';

-- 19067 - Pilha, modelo AAA (palito), alcalina
UPDATE public.produtos SET codigo = '19067' WHERE nome ILIKE '%pilha%aaa%';

-- 755 - Pincel atômico ponta grossa, cor azul
UPDATE public.produtos SET codigo = '755' WHERE nome ILIKE '%pincel%at%mico%azul%';

-- 758 - Pincel atômico, ponta grossa, cor vermelha
UPDATE public.produtos SET codigo = '758' WHERE nome ILIKE '%pincel%at%mico%vermelh%';

-- 759 - Pincel para quadro branco, não recarregável, cor azul
UPDATE public.produtos SET codigo = '759' WHERE nome ILIKE '%pincel%quadro%azul%' AND nome NOT ILIKE '%recarreg%vel%';

-- 760 - Pincel para quadro branco, não recarregável, cor preta
UPDATE public.produtos SET codigo = '760' WHERE nome ILIKE '%pincel%quadro%preto%' AND nome NOT ILIKE '%recarreg%vel%';

-- 762 - Pincel para quadro branco, não recarregável, cor vermelha
UPDATE public.produtos SET codigo = '762' WHERE nome ILIKE '%pincel%quadro%vermelh%' AND nome NOT ILIKE '%recarreg%vel%';

-- 18775 - Pincel recarregável, quadro branco, cor azul
UPDATE public.produtos SET codigo = '18775' WHERE nome ILIKE '%pincel%recarreg%vel%azul%';

-- 18777 - Pincel recarregável, quadro branco, cor vermelha
UPDATE public.produtos SET codigo = '18777' WHERE nome ILIKE '%pincel%recarreg%vel%vermelh%';

-- 18776 - Pincel recarregável, quadro branco, cor preta
UPDATE public.produtos SET codigo = '18776' WHERE nome ILIKE '%pincel%recarreg%vel%preto%';

-- 321143 - Ponta para reposição, cor branca (utilização pincel preto), pacote c/ 3
UPDATE public.produtos SET codigo = '321143' WHERE nome ILIKE '%ponta%reposi%o%preto%';

-- 321142 - Ponta para reposição, cor branca (utilização pincel azul), pacote c/ 3
UPDATE public.produtos SET codigo = '321142' WHERE nome ILIKE '%ponta%reposi%o%azul%';

-- 321144 - Ponta para reposição, cor branca (utilização pincel vermelho), pacote c/ 3
UPDATE public.produtos SET codigo = '321144' WHERE nome ILIKE '%ponta%reposi%o%vermelh%';

-- 18790 - Refil de tinta líquida para pincel marcador de quadro branco, cor azul
UPDATE public.produtos SET codigo = '18790' WHERE nome ILIKE '%refil%azul%';

-- 18791 - Refil de tinta líquida para pincel marcador de quadro branco, cor preta
UPDATE public.produtos SET codigo = '18791' WHERE nome ILIKE '%refil%preto%';

-- 18792 - Refil de tinta líquida para pincel marcador de quadro branco, cor vermelha
UPDATE public.produtos SET codigo = '18792' WHERE nome ILIKE '%refil%vermelh%';

-- 789 - Régua acrílica transparente de 30cm
UPDATE public.produtos SET codigo = '789' WHERE nome ILIKE '%r%gua%acr%lica%' OR nome ILIKE '%regua%';

-- =============================================
-- MATERIAL DE COPA/COZINHA/LIMPEZA
-- =============================================

-- 10989 - Água mineral natural, galão contendo 20 litros
UPDATE public.produtos SET codigo = '10989' WHERE nome ILIKE '%gua%mineral%';

-- 967 - Água sanitária, conteúdo 1 litro
UPDATE public.produtos SET codigo = '967' WHERE nome ILIKE '%gua%sanit%ria%';

-- 973 - Álcool etílico hidratado, 46° graus, líquido, 1 litro
UPDATE public.produtos SET codigo = '973' WHERE nome ILIKE '%lcool%';

-- 974 - Balde plástico, capacidade de 20 litros
UPDATE public.produtos SET codigo = '974' WHERE nome ILIKE '%balde%';

-- 325563 - Café torrado e moído, pacote com 500 gramas
UPDATE public.produtos SET codigo = '325563' WHERE nome ILIKE '%caf%';

-- 1173 - Copo descartável para água, 200 ml, pacote com 100 unidades
UPDATE public.produtos SET codigo = '1173' WHERE nome ILIKE '%copo%gua%' OR nome ILIKE '%copo%200%ml%' OR nome ILIKE '%copo%agua%';

-- 1174 - Copo descartável para café, 50 ml, pacote com 100 unidades
UPDATE public.produtos SET codigo = '1174' WHERE nome ILIKE '%copo%caf%' OR nome ILIKE '%copo%50%ml%';

-- 1162 - Coador (filtro) para café, papel celulose, nº 103, caixa c/ 30
UPDATE public.produtos SET codigo = '1162' WHERE nome ILIKE '%coador%' OR nome ILIKE '%filtro%caf%';

-- 326314 - Desinfetante à base de quaternário de amônio
UPDATE public.produtos SET codigo = '326314' WHERE nome ILIKE '%desinfetante%quatern%rio%' OR nome ILIKE '%desinfetante%quaternario%';

-- 1001 - Desinfetante bactericida a base de essência de pinho, 500 ml
UPDATE public.produtos SET codigo = '1001' WHERE nome ILIKE '%desinfetante%pinho%';

-- 1007 - Detergente líquido neutro, viscoso, 500ml
UPDATE public.produtos SET codigo = '1007' WHERE nome ILIKE '%detergente%';

-- 1148 - Dispenser higienizador (Saboneteira)
UPDATE public.produtos SET codigo = '1148' WHERE nome ILIKE '%dispenser%' OR nome ILIKE '%saboneteira%';

-- 1031 - Estopa branca, embalagem com 500 gramas
UPDATE public.produtos SET codigo = '1031' WHERE nome ILIKE '%estopa%';

-- 1022 - Esfregão para limpeza tipo saco de chão (saco de trigo)
UPDATE public.produtos SET codigo = '1022' WHERE nome ILIKE '%esfreg%o%';

-- 1026 - Esponja de lã de aço, pacote de 60g com 08 unidades
UPDATE public.produtos SET codigo = '1026' WHERE nome ILIKE '%esponja%a%o%' OR nome ILIKE '%esponja%aco%';

-- 1028 - Esponja dupla face para limpeza, antibactérias
UPDATE public.produtos SET codigo = '1028' WHERE nome ILIKE '%esponja%dupla%';

-- 1033 - Flanela para limpeza na cor amarela, 30 x 40 cm
UPDATE public.produtos SET codigo = '1033' WHERE nome ILIKE '%flanela%';

-- 6782 - Gás liquefeito de petróleo (GLP), botija com 13 kg
UPDATE public.produtos SET codigo = '6782' WHERE nome ILIKE '%g%s%liquefeito%' OR nome ILIKE '%glp%' OR nome ILIKE '%g%s%petr%leo%' OR nome ILIKE '%botija%g%s%';

-- 9400 - Inseticida (tipo spray), aerossol, mínimo 395 ml
UPDATE public.produtos SET codigo = '9400' WHERE nome ILIKE '%inseticida%';

-- 23221 - Papel higiênico, folha simples, rolos com 30 metros, pacote c/ 04
UPDATE public.produtos SET codigo = '23221' WHERE nome ILIKE '%papel%higi%nico%30%m%' OR (nome ILIKE '%papel%higi%nico%' AND nome ILIKE '%30%metro%');

-- 23222 - Papel higiênico, folha simples, rolos com 300 metros, pacote c/ 08
UPDATE public.produtos SET codigo = '23222' WHERE nome ILIKE '%papel%higi%nico%300%' OR (nome ILIKE '%papel%higi%nico%' AND nome ILIKE '%300%metro%');

-- 1044 - Papel toalha interfolhas, branco, 21 x 23 cm, pacote com 1.000 folhas
UPDATE public.produtos SET codigo = '1044' WHERE nome ILIKE '%papel%toalha%';

-- 13988 - Porta papel toalha (dispenser) para fixação na parede, aço inox
UPDATE public.produtos SET codigo = '13988' WHERE nome ILIKE '%porta%papel%';

-- 1058 - Rodo de plástico duplo, 40cm borracha dupla
UPDATE public.produtos SET codigo = '1058' WHERE nome ILIKE '%rodo%';

-- 1062 - Sabão em pó biodegradável, caixa com 500 g
UPDATE public.produtos SET codigo = '1062' WHERE nome ILIKE '%sab%o%em%p%';

-- 325697 - Sabonete líquido, antisséptico, perolado, 2 litros
UPDATE public.produtos SET codigo = '325697' WHERE nome ILIKE '%sabonete%';

-- 1061 - Sabão de coco biodegradável, em tablete de 200g
UPDATE public.produtos SET codigo = '1061' WHERE nome ILIKE '%sab%o%coco%';

-- 1060 - Sabão em barra, neutro, biodegradável, tablete de 200g
UPDATE public.produtos SET codigo = '1060' WHERE nome ILIKE '%sab%o%barra%';

-- 1071 - Saco plástico para coleta de lixo com 100 litros, embalagem com 100 unidades
UPDATE public.produtos SET codigo = '1071' WHERE nome ILIKE '%saco%100%litro%' OR nome ILIKE '%saco%lixo%100%';

-- 1067 - Saco plástico para coleta de lixo com 50 litros, embalagem com 100 unidades
UPDATE public.produtos SET codigo = '1067' WHERE nome ILIKE '%saco%50%litro%' OR nome ILIKE '%saco%lixo%50%';

-- 1066 - Saco plástico para coleta de lixo com 30 litros, embalagem com 100 unidades
UPDATE public.produtos SET codigo = '1066' WHERE nome ILIKE '%saco%30%litro%' OR nome ILIKE '%saco%lixo%30%';

-- 1236 - Toalha de cozinha em algodão (saco de trigo) alvejado, 68 x 40 cm
UPDATE public.produtos SET codigo = '1236' WHERE nome ILIKE '%toalha%cozinha%' OR nome ILIKE '%toalha%trigo%';

-- =============================================================================
-- 4. Relatório: Verificar produtos que ficaram sem código
-- =============================================================================
-- Para verificar quais produtos ficaram sem código oficial, execute:
-- SELECT id, nome, codigo FROM public.produtos WHERE codigo = 'TEMP_SEM_CODIGO';
