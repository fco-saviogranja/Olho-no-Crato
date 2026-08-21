# Servidor de desenvolvimento do Olho no Crato.
#
# Abre a pasta do site em http://localhost:5510 sem guardar nada em cache,
# para que qualquer alteracao apareca ao recarregar a pagina.
#
#   python ferramentas/servidor.py
import functools, http.server, os, socketserver, sys

PASTA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# a porta pode vir do ambiente ou da linha de comando, para conviver com outro
# servidor ja ocupando a padrao
PORTA = int(os.environ.get('PORT') or (sys.argv[1] if len(sys.argv) > 1 else 5510))


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def log_message(self, formato, *args):
        pass


Handler = functools.partial(SemCache, directory=PASTA)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('127.0.0.1', PORTA), Handler) as servidor:
    print('servindo em http://localhost:%d' % PORTA, flush=True)
    servidor.serve_forever()
