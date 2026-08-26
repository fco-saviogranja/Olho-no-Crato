// O olho da marca, desenhado uma vez e reaproveitado.
//
// Até aqui o símbolo existia em dois lugares apenas, o cabeçalho e o ícone da
// aba, e em nenhum deles fazia trabalho. Os dois momentos em que o site mais
// precisa dizer alguma coisa sem palavras são a espera e o vazio: enquanto o
// TCE responde, e quando não há o que mostrar. É onde o olho entra.
//
// Nada aqui usa cor fixa: o traço segue currentColor, então o mesmo desenho
// serve no claro, no escuro e sobre o vermelhão do cabeçalho.

const NS = 'http://www.w3.org/2000/svg';

function svg(classe, titulo) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 46 46');
  s.setAttribute('class', classe);
  if (titulo) {
    s.setAttribute('role', 'img');
    const t = document.createElementNS(NS, 'title');
    t.textContent = titulo;
    s.append(t);
  } else {
    s.setAttribute('aria-hidden', 'true');
  }
  return s;
}

function no(tag, atributos) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(atributos)) e.setAttribute(k, v);
  return e;
}

/**
 * O olho aberto: íris vazada e pupila cheia, as mesmas medidas do cabeçalho.
 * `piscando` liga a animação; quem pediu movimento reduzido no sistema recebe
 * o olho parado, e parado ele continua dizendo a mesma coisa.
 */
export function olho({ piscando = false, titulo } = {}) {
  const s = svg('olho' + (piscando ? ' olho-piscando' : ''), titulo);
  const g = no('g', { class: 'olho-globo' });
  g.append(no('circle', { cx: 23, cy: 23, r: 9, class: 'olho-iris' }));
  g.append(no('circle', { cx: 23, cy: 23, r: 2.5, class: 'olho-pupila' }));
  s.append(g);
  // a pálpebra só aparece no quadro fechado da animação, por cima da íris
  s.append(no('path', { d: 'M12 23h22', class: 'olho-palpebra' }));
  return s;
}

/**
 * O olho fechado, para quando não há o que ver. É o mesmo traço da pálpebra,
 * com os cílios curtos que a xilogravura usaria.
 */
export function olhoFechado({ titulo } = {}) {
  const s = svg('olho olho-fechado', titulo);
  s.append(no('path', { d: 'M12 24c4 4 18 4 22 0', class: 'olho-iris' }));
  s.append(no('path', { d: 'M15 29l-2 3M23 31v3.5M31 29l2 3', class: 'olho-cilios' }));
  return s;
}
