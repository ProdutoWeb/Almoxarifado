-- Migration to update product codes based on PDF
-- 1. First, mark all products as inactive and without code
UPDATE public.produtos 
SET is_active = false, observacao = 'Código não encontrado no PDF', codigo = 'TEMP_' || substring(id::text from 1 for 8);

-- 2. Update matched products using ILIKE to find them by name
UPDATE public.produtos SET is_active = true, codigo = '2057', observacao = NULL WHERE nome ILIKE '%apagador%quadro%';
UPDATE public.produtos SET is_active = true, codigo = '2060', observacao = NULL WHERE nome ILIKE '%apontador%';
UPDATE public.produtos SET is_active = true, codigo = '846', observacao = NULL WHERE nome ILIKE '%bloco%recado%';
UPDATE public.produtos SET is_active = true, codigo = '188', observacao = NULL WHERE nome ILIKE '%borracha%branca%';
UPDATE public.produtos SET is_active = true, codigo = '200', observacao = NULL WHERE nome ILIKE '%caixa%arquivo%morto%';
UPDATE public.produtos SET is_active = true, codigo = '225', observacao = NULL WHERE nome ILIKE '%caneta%esferogr%fica%azul%';
UPDATE public.produtos SET is_active = true, codigo = '226', observacao = NULL WHERE nome ILIKE '%caneta%esferogr%fica%preta%';
UPDATE public.produtos SET is_active = true, codigo = '227', observacao = NULL WHERE nome ILIKE '%caneta%esferogr%fica%vermelha%';
UPDATE public.produtos SET is_active = true, codigo = '233', observacao = NULL WHERE nome ILIKE '%marca%texto%amarela%';
UPDATE public.produtos SET is_active = true, codigo = '235', observacao = NULL WHERE nome ILIKE '%marca%texto%verde%';
UPDATE public.produtos SET is_active = true, codigo = '320339', observacao = NULL WHERE nome ILIKE '%capa%processo%';
UPDATE public.produtos SET is_active = true, codigo = '297', observacao = NULL WHERE nome ILIKE '%clips%2/0%';
UPDATE public.produtos SET is_active = true, codigo = '299', observacao = NULL WHERE nome ILIKE '%clips%6/0%';
UPDATE public.produtos SET is_active = true, codigo = '307', observacao = NULL WHERE nome ILIKE '%cola%branca%';
UPDATE public.produtos SET is_active = true, codigo = '361', observacao = NULL WHERE nome ILIKE '%envelope%branco%';
UPDATE public.produtos SET is_active = true, codigo = '362', observacao = NULL WHERE nome ILIKE '%envelope%kraft%';
UPDATE public.produtos SET is_active = true, codigo = '436', observacao = NULL WHERE nome ILIKE '%fita%crepe%';
UPDATE public.produtos SET is_active = true, codigo = '431', observacao = NULL WHERE nome ILIKE '%fita%adesiva%transparente%12mm%';
UPDATE public.produtos SET is_active = true, codigo = '453', observacao = NULL WHERE nome ILIKE '%fita%adesiva%transparente%45mm%';
UPDATE public.produtos SET is_active = true, codigo = '18785', observacao = NULL WHERE nome ILIKE '%grampeador%';
UPDATE public.produtos SET is_active = true, codigo = '490', observacao = NULL WHERE nome ILIKE '%grampo%26%';
UPDATE public.produtos SET is_active = true, codigo = '491', observacao = NULL WHERE nome ILIKE '%grampo%pl%stico%';
UPDATE public.produtos SET is_active = true, codigo = '900', observacao = NULL WHERE nome ILIKE '%impresso%ufes%';
UPDATE public.produtos SET is_active = true, codigo = '523', observacao = NULL WHERE nome ILIKE '%l%pis%02%';
UPDATE public.produtos SET is_active = true, codigo = '18787', observacao = NULL WHERE nome ILIKE '%livro%protocolo%';
UPDATE public.produtos SET is_active = true, codigo = '322809', observacao = NULL WHERE nome ILIKE '%papel%alma%o%';
UPDATE public.produtos SET is_active = true, codigo = '654', observacao = NULL WHERE nome ILIKE '%papel%reciclado%';
UPDATE public.produtos SET is_active = true, codigo = '681', observacao = NULL WHERE nome ILIKE '%pasta%classificadora%';
UPDATE public.produtos SET is_active = true, codigo = '688', observacao = NULL WHERE nome ILIKE '%pasta%suspensa%';
UPDATE public.produtos SET is_active = true, codigo = '566', observacao = NULL WHERE nome ILIKE '%papel%sulfite%';
UPDATE public.produtos SET is_active = true, codigo = '7340', observacao = NULL WHERE nome ILIKE '%pilha%aa%';
UPDATE public.produtos SET is_active = true, codigo = '19067', observacao = NULL WHERE nome ILIKE '%pilha%aaa%';
UPDATE public.produtos SET is_active = true, codigo = '755', observacao = NULL WHERE nome ILIKE '%pincel%at%mico%azul%';
UPDATE public.produtos SET is_active = true, codigo = '758', observacao = NULL WHERE nome ILIKE '%pincel%at%mico%vermelh%';
UPDATE public.produtos SET is_active = true, codigo = '759', observacao = NULL WHERE nome ILIKE '%pincel%quadro%azul%';
UPDATE public.produtos SET is_active = true, codigo = '760', observacao = NULL WHERE nome ILIKE '%pincel%quadro%preto%';
UPDATE public.produtos SET is_active = true, codigo = '762', observacao = NULL WHERE nome ILIKE '%pincel%quadro%vermelh%';
UPDATE public.produtos SET is_active = true, codigo = '18775', observacao = NULL WHERE nome ILIKE '%pincel%recarreg%vel%azul%';
UPDATE public.produtos SET is_active = true, codigo = '18777', observacao = NULL WHERE nome ILIKE '%pincel%recarreg%vel%vermelh%';
UPDATE public.produtos SET is_active = true, codigo = '18776', observacao = NULL WHERE nome ILIKE '%pincel%recarreg%vel%preto%';
UPDATE public.produtos SET is_active = true, codigo = '321143', observacao = NULL WHERE nome ILIKE '%ponta%reposi%o%preto%';
UPDATE public.produtos SET is_active = true, codigo = '321142', observacao = NULL WHERE nome ILIKE '%ponta%reposi%o%azul%';
UPDATE public.produtos SET is_active = true, codigo = '321144', observacao = NULL WHERE nome ILIKE '%ponta%reposi%o%vermelh%';
UPDATE public.produtos SET is_active = true, codigo = '18790', observacao = NULL WHERE nome ILIKE '%refil%azul%';
UPDATE public.produtos SET is_active = true, codigo = '18791', observacao = NULL WHERE nome ILIKE '%refil%preto%';
UPDATE public.produtos SET is_active = true, codigo = '18792', observacao = NULL WHERE nome ILIKE '%refil%vermelh%';
UPDATE public.produtos SET is_active = true, codigo = '789', observacao = NULL WHERE nome ILIKE '%r%gua%acr%lica%';
UPDATE public.produtos SET is_active = true, codigo = '10989', observacao = NULL WHERE nome ILIKE '%%gua%mineral%';
UPDATE public.produtos SET is_active = true, codigo = '967', observacao = NULL WHERE nome ILIKE '%%gua%sanit%ria%';
UPDATE public.produtos SET is_active = true, codigo = '973', observacao = NULL WHERE nome ILIKE '%%lcool%';
UPDATE public.produtos SET is_active = true, codigo = '974', observacao = NULL WHERE nome ILIKE '%balde%';
UPDATE public.produtos SET is_active = true, codigo = '325563', observacao = NULL WHERE nome ILIKE '%caf%%';
UPDATE public.produtos SET is_active = true, codigo = '1173', observacao = NULL WHERE nome ILIKE '%copo%%gua%';
UPDATE public.produtos SET is_active = true, codigo = '1174', observacao = NULL WHERE nome ILIKE '%copo%caf%%';
UPDATE public.produtos SET is_active = true, codigo = '1162', observacao = NULL WHERE nome ILIKE '%coador%';
UPDATE public.produtos SET is_active = true, codigo = '326314', observacao = NULL WHERE nome ILIKE '%desinfetante%quatern%rio%';
UPDATE public.produtos SET is_active = true, codigo = '1001', observacao = NULL WHERE nome ILIKE '%desinfetante%pinho%';
UPDATE public.produtos SET is_active = true, codigo = '1007', observacao = NULL WHERE nome ILIKE '%detergente%';
UPDATE public.produtos SET is_active = true, codigo = '1148', observacao = NULL WHERE nome ILIKE '%dispenser%';
UPDATE public.produtos SET is_active = true, codigo = '1031', observacao = NULL WHERE nome ILIKE '%estopa%';
UPDATE public.produtos SET is_active = true, codigo = '1022', observacao = NULL WHERE nome ILIKE '%esfreg%o%';
UPDATE public.produtos SET is_active = true, codigo = '1026', observacao = NULL WHERE nome ILIKE '%esponja%a%o%';
UPDATE public.produtos SET is_active = true, codigo = '1028', observacao = NULL WHERE nome ILIKE '%esponja%dupla%';
UPDATE public.produtos SET is_active = true, codigo = '1033', observacao = NULL WHERE nome ILIKE '%flanela%';
UPDATE public.produtos SET is_active = true, codigo = '6782', observacao = NULL WHERE nome ILIKE '%g%s%';
UPDATE public.produtos SET is_active = true, codigo = '9400', observacao = NULL WHERE nome ILIKE '%inseticida%';
UPDATE public.produtos SET is_active = true, codigo = '23221', observacao = NULL WHERE nome ILIKE '%papel%higi%nico%30%';
UPDATE public.produtos SET is_active = true, codigo = '23222', observacao = NULL WHERE nome ILIKE '%papel%higi%nico%300%';
UPDATE public.produtos SET is_active = true, codigo = '1044', observacao = NULL WHERE nome ILIKE '%papel%toalha%';
UPDATE public.produtos SET is_active = true, codigo = '13988', observacao = NULL WHERE nome ILIKE '%porta%papel%';
UPDATE public.produtos SET is_active = true, codigo = '1058', observacao = NULL WHERE nome ILIKE '%rodo%';
UPDATE public.produtos SET is_active = true, codigo = '1062', observacao = NULL WHERE nome ILIKE '%sab%o%em%p%%';
UPDATE public.produtos SET is_active = true, codigo = '325697', observacao = NULL WHERE nome ILIKE '%sabonete%';
UPDATE public.produtos SET is_active = true, codigo = '1061', observacao = NULL WHERE nome ILIKE '%sab%o%coco%';
UPDATE public.produtos SET is_active = true, codigo = '1060', observacao = NULL WHERE nome ILIKE '%sab%o%barra%';
UPDATE public.produtos SET is_active = true, codigo = '1071', observacao = NULL WHERE nome ILIKE '%saco%100%';
UPDATE public.produtos SET is_active = true, codigo = '1067', observacao = NULL WHERE nome ILIKE '%saco%50%';
UPDATE public.produtos SET is_active = true, codigo = '1066', observacao = NULL WHERE nome ILIKE '%saco%30%';
UPDATE public.produtos SET is_active = true, codigo = '1236', observacao = NULL WHERE nome ILIKE '%toalha%';

-- If unaccent is not available, we could do ILIKE '%café%' and ILIKE '%cafe%' but I will assume unaccent is installed or they can run this code as is if no unaccent is needed by removing it.
-- We can also duplicate with normal string if unaccent fails.
