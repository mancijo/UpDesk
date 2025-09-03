from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField
from wtforms.validators import DataRequired, Email, Length, EqualTo
from flask_wtf.file import FileField, FileAllowed

class CriarUsuarioForm(FlaskForm):
    nome = StringField('Nome de Usuário', validators=[DataRequired(), Length(min=3, max=25)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    telefone = StringField('Telefone', validators=[DataRequired(), Length(min=10, max=15)])
    setor = StringField('Setor', validators=[DataRequired(), Length(min=2, max=50)])
    cargo = StringField('cargo', validators=[DataRequired(), Length(min=2, max=50)])
    senha = PasswordField('Senha', validators=[DataRequired(), Length(min=6)])
    confirma_senha = PasswordField('Confirme a Senha', validators=[DataRequired(), EqualTo('senha')])
    submit = SubmitField('Cadastrar')

class EditarUsuarioForm(FlaskForm):
    nome = StringField('nome', validators=[DataRequired(), Length(min=3, max=25)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    telefone = StringField('Telefone', validators=[DataRequired(), Length(min=10, max=15)])
    setor = StringField('Setor', validators=[DataRequired(), Length(min=2, max=50)])
    cargo = StringField('cargo', validators=[DataRequired(), Length(min=2, max=50)])
    senha = PasswordField('Senha', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Editar')

class chamadoForm(FlaskForm):
    titulo = StringField('Titulo', validators=[DataRequired(), Length(min=5, max=100)])
    descricao = StringField('Descrição', validators=[DataRequired(), Length(min=10)])
    afetado = SelectField('Quem esse chamado afeta', choices=[], validators=[DataRequired()])
    prioridade = StringField('Prioridade', validators=[DataRequired(), Length(min=3, max=20)])
    anexo = FileField('Adicionar Anexo', validators=[FileAllowed(['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx'])])
    submit = SubmitField('Buscar solução com a IA')

class LoginForm(FlaskForm):
    Email = StringField('Email', validators=[DataRequired(), Email()])
    senha = PasswordField('Senha', validators=[DataRequired()])
    Submit =  SubmitField('Login')


    


