"""
Definição dos Formulários da Aplicação

Responsabilidade:
- Centralizar a definição de todos os formulários usados no projeto utilizando a biblioteca Flask-WTF.
- Cada classe representa um formulário, definindo seus campos, tipos e regras de validação (validators).
- A integração com o Flask-WTF garante a segurança contra ataques CSRF.
"""
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, TextAreaField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional, ValidationError, Regexp
from flask_wtf.file import FileField, FileAllowed

class CriarUsuarioForm(FlaskForm):
    """Formulário para criação de usuário corporativo.
    Regras adicionais:
    - Email deve pertencer ao domínio @updesk.com.br
    - Setor deve ser uma das opções predefinidas
    - Senha deve conter pelo menos uma letra e um número
    """
    nome = StringField('Nome de Usuário', validators=[DataRequired(message='Este campo é obrigatório.'), Length(min=3, max=25)])
    email = StringField('Email', validators=[DataRequired(message='Este campo é obrigatório.'), Email(message='Formato de e-mail inválido.')])
    telefone = StringField('Telefone', validators=[DataRequired(message='Este campo é obrigatório.'), Length(min=10, max=15)])
    setor = SelectField('Setor', choices=[
        ('Administrativos e Estratégicos', 'Administrativos e Estratégicos'),
        ('Operacionais', 'Operacionais'),
        ('Comerciais e de Relacionamento', 'Comerciais e de Relacionamento'),
        ('Tecnologia e Inovação', 'Tecnologia e Inovação'),
        ('Serviços Internos', 'Serviços Internos')
    ], validators=[DataRequired(message='Este campo é obrigatório.')])
    cargo = SelectField('Cargo', choices=[
        ('Usuário', 'Usuário'),
        ('Supervisor', 'Supervisor'),
        ('N1', 'N1'),
        ('N2', 'N2')
    ], validators=[DataRequired(message='Este campo é obrigatório.')])
    senha = PasswordField('Senha', validators=[DataRequired(message='Este campo é obrigatório.'), Length(min=6, message='Mínimo 6 caracteres.'), Regexp(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$', message='A senha deve ter letras e números.')])
    confirma_senha = PasswordField('Confirme a Senha', validators=[DataRequired(message='Este campo é obrigatório.'), EqualTo('senha', message='As senhas não coincidem.')])
    submit = SubmitField('Cadastrar')

    def validate_email(self, field):
        dominio = '@updesk.com.br'
        if not field.data.lower().endswith(dominio):
            raise ValidationError(f'O e-mail deve terminar com {dominio}')

class EditarUsuarioForm(FlaskForm):
    nome = StringField('Nome', validators=[DataRequired(message='Este campo é obrigatório.'), Length(min=3, max=25)])
    email = StringField('Email', validators=[DataRequired(message='Este campo é obrigatório.'), Email(message='Formato de e-mail inválido.')])
    telefone = StringField('Telefone', validators=[Length(min=2, max=15)])
    setor = SelectField('Setor', choices=[
        ('Administrativos e Estratégicos', 'Administrativos e Estratégicos'),
        ('Operacionais', 'Operacionais'),
        ('Comerciais e de Relacionamento', 'Comerciais e de Relacionamento'),
        ('Tecnologia e Inovação', 'Tecnologia e Inovação'),
        ('Serviços Internos', 'Serviços Internos')
    ], validators=[DataRequired(message='Este campo é obrigatório.')])
    cargo = SelectField('Cargo', choices=[
        ('Usuário', 'Usuário'),
        ('Supervisor', 'Supervisor'),
        ('N1', 'N1'),
        ('N2', 'N2')
    ], validators=[DataRequired(message='Este campo é obrigatório.')])
    senha = PasswordField('Nova Senha (deixe em branco para não alterar)', validators=[Length(min=6), Regexp(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$', message='A senha deve ter letras e números.')])
    submit = SubmitField('Editar')

    def validate_email(self, field):
        dominio = '@updesk.com.br'
        if not field.data.lower().endswith(dominio):
            raise ValidationError(f'O e-mail deve terminar com {dominio}')

    def validate_senha(self, field):
        # Permite vazio (sem alteração)
        if not field.data:
            return
        # RegExp já cobre, mas caso mude a RegExp acima, mantemos esta verificação de defesa
        import re
        if not re.search(r'[A-Za-z]', field.data) or not re.search(r'\d', field.data):
            raise ValidationError('A senha deve conter pelo menos uma letra e um número.')

class chamadoForm(FlaskForm):
    solicitante = StringField('Solicitante', render_kw={'readonly': True})
    status = SelectField('Status', choices=[('Aberto', 'Aberto'), ('Em Andamento', 'Em Andamento'), ('Concluído', 'Concluído'), ('Fechado', 'Fechado')], render_kw={'readonly': True}, validators=[Optional()])
    titulo = StringField('Titulo', validators=[DataRequired('Este campo é obrigatório.'), Length(min=5, max=100)])
    descricao = TextAreaField('Descrição', validators=[DataRequired('Este campo é obrigatório.'), Length(min=10)])
    afetado = SelectField('Quem esse chamado afeta', choices=[('Eu', 'Somente eu'), ('Meu setor', 'Meu setor'), ('Empresa ao todo', 'Empresa ao todo')], validators=[DataRequired()])
    prioridade = SelectField('Prioridade', choices=[('Não Classificada', 'Não Classificada'), ('Baixa', 'Baixa'), ('Média', 'Média'), ('Alta', 'Alta'), ('Urgente', 'Urgente')], validators=[DataRequired()])
    anexo = FileField('Adicionar Anexo', validators=[FileAllowed(['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx'])])
    submit = SubmitField('Buscar solução com a IA')

class LoginForm(FlaskForm):
    """
    Formulário de autenticação do usuário.
    Usado na página de login para capturar e validar as credenciais.
    """
    # Campo de Email: Requer que seja preenchido e que tenha um formato de email válido.
    # O nome da variável "Email" com "E" maiúsculo é como foi definido e deve ser usado no template.
    email = StringField('Email', validators=[DataRequired(message='Este campo é obrigatório.'), Email()])
    
    # Campo de Senha: Requer que seja preenchido.
    senha = PasswordField('Senha', validators=[DataRequired(message='Este campo é obrigatório.')])
    
    # Botão de Submit: Texto que aparecerá no botão.
    Submit =  SubmitField('Login')

class FormularioEsqueciSenha(FlaskForm):
    email = StringField('Email', validators=[DataRequired(message='Este campo é obrigatório.'), Email()])
    submit = SubmitField('Recuperar Senha')
    
