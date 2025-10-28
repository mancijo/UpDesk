import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChamadoProp } from '../../context/ChamadoContext';

// Exemplo de dados, implementar função de requisção de dados
const mockChamados: ChamadoProp[] = [
  {
    chamadoId: 101,
    solicitanteId: 1,
    solicitante: { id: '1', nome: 'Alice', telefone: '123456789', email: 'alice@example.com', setor: 'RH', cargo: 'Analista' },
    tituloChamado: 'Problema com impressora',
    descricaoChamado: 'A impressora do segundo andar não está funcionando. A luz de erro está piscando e não consigo imprimir nenhum documento importante.',
    categoriaChamado: 'Hardware',
    prioridadeChamado: 'alta',
    statusChamado: 'aberto',
    dataAbertura: '2025-10-24T10:00:00Z',
    atendenteId: 25,
  },
  {
    chamadoId: 102,
    solicitanteId: 2,
    solicitante: { id: '2', nome: 'Beto', telefone: '987654321', email: 'beto@example.com', setor: 'TI', cargo: 'Desenvolvedor' },
    tituloChamado: 'Software não abre',
    descricaoChamado: "O software de contabilidade (SAP) exibe um erro 'licença inválida' ao iniciar. Preciso acessar para fechar o balanço mensal.",
    categoriaChamado: 'Software',
    prioridadeChamado: 'urgente',
    statusChamado: 'em_atendimento',
    dataAbertura: '2025-10-24T11:30:00Z',
    atendenteId: 26,
  },
  {
    chamadoId: 103,
    solicitanteId: 3,
    solicitante: { id: '3', nome: 'Carla', telefone: '123123123', email: 'carla@example.com', setor: 'Financeiro', cargo: 'Gerente' },
    tituloChamado: 'Mouse quebrado',
    descricaoChamado: 'O mouse do meu computador parou de funcionar. Já tentei trocar a pilha e a porta USB, mas não adiantou.',
    categoriaChamado: 'Hardware',
    prioridadeChamado: 'media',
    statusChamado: 'resolvido',
    dataAbertura: '2025-10-23T15:00:00Z',
    dataUltimaModificacao: '2025-10-24T09:00:00Z',
    atendenteId: 25,
    solucaoAplicada: 'Mouse foi substituído por um novo.'
  },
];

export default function VerChamadosScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<ChamadoProp | null>(null);

  const handleVerChamado = (chamado: ChamadoProp) => {
    setSelectedChamado(chamado);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Cabeçalho da Tabela */}
        <View style={styles.tableRowHeader}>
          <Text style={[styles.headerText, styles.idColumn]}>ID</Text>
          <Text style={[styles.headerText, styles.userColumn]}>Usuário</Text>
          <Text style={[styles.headerText, styles.titleColumn]}>Título</Text>
          <Text style={[styles.headerText, styles.actionColumn]}>Ação</Text>
        </View>

        {/* Linhas da Tabela */}
        {mockChamados.map((chamado) => (
          <View key={chamado.chamadoId} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.idColumn]}>{chamado.chamadoId}</Text>
            <Text style={[styles.cellText, styles.userColumn]}>{chamado.solicitante?.nome}</Text>
            <Text style={[styles.cellText, styles.titleColumn]}>{chamado.tituloChamado}</Text>
            <View style={[styles.cellText, styles.actionColumn]}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleVerChamado(chamado)}>
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal para Detalhes do Chamado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalhes do Chamado</Text>
            {selectedChamado && (
              <>
                <Text style={styles.modalText}><Text style={styles.modalLabel}>ID:</Text> {selectedChamado.chamadoId}</Text>
                <Text style={styles.modalText}><Text style={styles.modalLabel}>Solicitante:</Text> {selectedChamado.solicitante?.nome}</Text>
                <Text style={styles.modalText}><Text style={styles.modalLabel}>Descrição:</Text> {selectedChamado.descricaoChamado}</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#2B4C7E',
    paddingVertical: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
    paddingVertical: 8
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  cellText: {
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 4
  },
  idColumn: {
    flex: 0.15
  },
  userColumn: {
    flex: 0.3
  },
  titleColumn: {
    flex: 0.35
  },
  actionColumn: {
    flex: 0.2
  },
  actionButton: {
    backgroundColor: '#567EBB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'center'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B4C7E',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22
  },
  modalLabel: {
    fontWeight: 'bold'
  },
  closeButton: {
    backgroundColor: '#606D80',
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white', fontWeight: 'bold', fontSize: 16
  },
});