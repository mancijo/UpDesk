import os
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from models import Usuario, Chamado, db

app = Flask(__name__)
CORS(app)


# Rotas
