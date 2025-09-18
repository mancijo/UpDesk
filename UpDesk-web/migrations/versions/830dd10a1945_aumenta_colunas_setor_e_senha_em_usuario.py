"""Aumenta colunas setor e senha em Usuario

Revision ID: 830dd10a1945
Revises: abf7399c4550
Create Date: 2024-05-22 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# identificadores de revisão, usados pelo Alembic.
revision = '830dd10a1945'
down_revision = 'abf7399c4550'
branch_labels = None
depends_on = None


def upgrade():
    # ### comandos gerados automaticamente pelo Alembic - ajuste se necessário! ###
    with op.batch_alter_table('Usuario', schema=None) as batch_op:
        batch_op.alter_column('setor',
               existing_type=sa.VARCHAR(length=10, collation='SQL_Latin1_General_CP1_CI_AS'),
               type_=sa.String(length=50),
               existing_nullable=True)
        batch_op.alter_column('senha',
               existing_type=sa.VARCHAR(length=30, collation='SQL_Latin1_General_CP1_CI_AS'),
               type_=sa.String(length=255),
               existing_nullable=True)
    # ### fim dos comandos Alembic ###


def downgrade():
    # ### comandos gerados automaticamente pelo Alembic - ajuste se necessário! ###
    with op.batch_alter_table('Usuario', schema=None) as batch_op:
        batch_op.alter_column('senha',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(length=30, collation='SQL_Latin1_General_CP1_CI_AS'),
               existing_nullable=True)
        batch_op.alter_column('setor',
               existing_type=sa.String(length=50),
               type_=sa.VARCHAR(length=10, collation='SQL_Latin1_General_CP1_CI_AS'),
               existing_nullable=True)
    # ### fim dos comandos Alembic ###