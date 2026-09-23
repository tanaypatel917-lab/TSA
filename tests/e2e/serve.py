import functools
import http.server
import os
import sys


class StaticServer(http.server.ThreadingHTTPServer):
    request_queue_size = 128


class StaticHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        page = os.path.join(self.directory, "404.html")
        if code != 404 or not os.path.exists(page):
            return super().send_error(code, message, explain)
        with open(page, "rb") as file:
            body = file.read()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


port = int(sys.argv[1])
handler = functools.partial(StaticHandler, directory=sys.argv[2])
StaticServer(("127.0.0.1", port), handler).serve_forever()
