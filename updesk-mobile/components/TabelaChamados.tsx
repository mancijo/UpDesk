import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Chamado } from '../context/ChamadoContext';



// Mock data based on ChamadoContext and user request
const mockChamados = [
  {
    chamadoId: 1,
    solicitante: { nome: 'Alice' },
    tituloChamado: 'Problema com impressora',
    descricaoChamado: 'A impressora do segundo andar não está funcionando.',
    statusChamado: 'aberto',
  },
  {
    chamadoId: 2,
    solicitante: { nome: 'Beto' },
    tituloChamado: 'Software não abre',
    descricaoChamado: 'O software de contabilidade exibe um erro ao iniciar.',
    statusChamado: 'em_atendimento',
  },
  {
    chamadoId: 3,
    solicitante: { nome: 'Carla' },
    tituloChamado: 'Mouse quebrado',
    descricaoChamado: 'O mouse do meu computador não está funcionando.',
    statusChamado: 'resolvido',
  },
];

const TabelaChamados = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState(null);

  const handleVerChamado = (chamado: Chamado) => {
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
          <Text style={styles.cell}>{chamado.solicitante.nome}</Text>
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
              <Text style={styles.modalText}><Text style={styles.modalLabel}>Solicitante:</Text> {selectedChamado.solicitante.nome}</Text>
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
