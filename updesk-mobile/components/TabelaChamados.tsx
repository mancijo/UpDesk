import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChamadoProp } from '../context/ChamadoContext';



// Mock data based on ChamadoContext and user request
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

const TabelaChamados = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<ChamadoProp | null>(null);

  const handleVerChamado = (chamado: ChamadoProp) => {
    setSelectedChamado(chamado);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Solicitante</Text>
        <Text style={styles.headerText}>ID</Text>
        <Text style={styles.headerText}>Assunto</Text>
        <Text style={styles.headerText}>Ação</Text>
      </View>
      {mockChamados.map((chamado) => (
        <View key={chamado.chamadoId} style={styles.row}>
          <Text style={styles.cell}>{chamado.solicitante!.nome}</Text>
          <Text style={styles.cell}>{chamado.chamadoId}</Text>
          <Text style={styles.cell}>{chamado.tituloChamado}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleVerChamado(chamado)}>
            <Text style={styles.buttonText}>Ver</Text>
          </TouchableOpacity>
        </View>
      ))}
      {selectedChamado && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}><Text style={styles.modalLabel}>Solicitante:</Text> {selectedChamado.solicitante!.nome}</Text>
              <Text style={styles.modalText}><Text style={styles.modalLabel}>Título:</Text> {selectedChamado.tituloChamado}</Text>
              <Text style={styles.modalText}><Text style={styles.modalLabel}>Descrição:</Text> {selectedChamado.descricaoChamado}</Text>
              <Text style={styles.modalText}><Text style={styles.modalLabel}>Status:</Text> {selectedChamado.statusChamado}</Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  modalLabel: {
    fontWeight: 'bold',
  },
});

export default TabelaChamados;
