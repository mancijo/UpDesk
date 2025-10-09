"""
Arquivo de Migração do Banco de Dados (Automático)

Responsabilidade:
- Representa uma versão específica do esquema do banco de dados.
- Contém as funções `upgrade()` e `downgrade()` que aplicam e revertem as alterações no esquema.
- Este arquivo é gerado automaticamente pelo Alembic (Flask-Migrate) e não deve ser editado manualmente,
  a menos que você tenha um conhecimento profundo de como as migrações funcionam.
"""
"""Migração inicial.

Revision ID: abf7399c4550
Revises: 
Create Date: 2025-09-06 17:26:04.063826

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# identificadores de revisão, usados pelo Alembic.
revision = 'abf7399c4550'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### comandos gerados automaticamente pelo Alembic - ajuste se necessário! ###
    # 1. Criar as novas tabelas
    op.create_table('Usuario',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('nome', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('telefone', sa.String(length=15), nullable=True),
    sa.Column('setor', sa.String(length=10), nullable=True),
    sa.Column('cargo', sa.String(length=50), nullable=False),
    sa.Column('senha', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('Chamado',
    sa.Column('chamado_ID', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('atendenteID', sa.Integer(), nullable=True),
    sa.Column('solicitanteID', sa.Integer(), nullable=True),
    sa.Column('titulo_Chamado', sa.String(length=255), nullable=False),
    sa.Column('descricao_Chamado', sa.Text(), nullable=False),
    sa.Column('categoria_Chamado', sa.String(length=100), nullable=False),
    sa.Column('prioridade_Chamado', sa.String(length=15), nullable=False),
    sa.Column('anexo_Chamado', sa.LargeBinary(), nullable=True),
    sa.Column('status_Chamado', sa.String(length=20), nullable=True),
    sa.Column('dataAbertura', sa.DateTime(), nullable=True),
    sa.Column('dataUltimaModificacao', sa.DateTime(), nullable=True),
    sa.Column('solucaoSugerida', sa.Text(), nullable=True),
    sa.Column('solucaoAplicada', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['atendenteID'], ['Usuario.id'], ),
    sa.ForeignKeyConstraint(['solicitanteID'], ['Usuario.id'], ),
    sa.PrimaryKeyConstraint('chamado_ID')
    )
    op.create_table('Interacoes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('chamado_id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('mensagem', sa.Text(), nullable=False),
    sa.Column('data_criacao', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['chamado_id'], ['Chamado.chamado_ID'], ),
    sa.ForeignKeyConstraint(['usuario_id'], ['Usuario.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### fim dos comandos Alembic ###