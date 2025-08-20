from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo

class CriarUsuarioForm(FlaskForm):
    nome = StringField('Nome de Usuário', validators=[DataRequired(), Length(min=3, max=25)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    telefone = StringField('Telefone', validators=[DataRequired(), Length(min=10, max=15)])
    setor = StringField('Setor', validators=[DataRequired(), Length(min=2, max=50)])
    cargo = StringField('cargo', validators=[DataRequired(), Length(min=2, max=50)])
    senha = PasswordField('Senha', validators=[DataRequired(), Length(min=6)])
    confirma_senha = PasswordField('Confirme a Senha', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Cadastrar')


