---
id: ScadaInterfaceMasterStructure
sidebar_position: 0
title: Architettura ScadaInterface
sidebar_label: Scada Interface
pagination_prev: null
hide_table_of_contents: true
---

# 🛠️ Architettura ScadaInterface

## ⚙️ Scopo

Per garantire una comunicazione robusta e manutenibile tra il PLC e il sistema SCADA, è stata creata una struttura dati dedicata e unificata.  
Questa struttura, un'istanza di `ST_ScadaInterface`, funge da unica _fonte di verità_ per tutti i dati scambiati tramite OPC UA.

È una struttura di tipo **NJ**, progettata per sfruttare la comunicazione basata su "tag", ed è suddivisa in due parti logiche:

- **Egress**: Dati che fluiscono **DAL PLC ALLO SCADA** (sola lettura per lo SCADA).
- **Ingress**: Dati e comandi che fluiscono **DALLO SCADA AL PLC** (scrivibili dallo SCADA).

---

## ⚙️ Struttura Master

Per prima cosa, definiamo la struttura principale che conterrà i due flussi di dati.

```iecst
(* Struttura master per l'interfaccia SCADA *)
TYPE ST_ScadaInterface :
STRUCT				NJ
    Ingress	: ST_Ingress; // Dati IN ENTRATA dallo SCADA
    Egress	: ST_Egress;  // Dati IN USCITA verso lo SCADA
END_STRUCT
END_TYPE
```

---

## ⚙️ Struttura `ST_Egress` (PLC → SCADA)

Questa struttura contiene tutte le informazioni di stato, le analisi di produzione e i dati macchina che il PLC rende disponibili al sistema SCADA.

### ⚙️ Flag di Stato Macchina

| Nome Variabile        | Tipo Dati | Descrizione                                                |
|-----------------------|-----------|------------------------------------------------------------|
| IsRunning             | `BOOL`    | Flag VERO quando la macchina è in uno stato di marcia.     |
| IsStopped             | `BOOL`    | Flag VERO quando la macchina è ferma.                      |
| IsInEmergency         | `BOOL`    | Flag VERO quando un'emergenza è attiva.                   |
| IsWaitingDownstream   | `BOOL`    | Flag VERO quando in attesa di un segnale dalla macchina a valle. |
| IsWaitingUpstream     | `BOOL`    | Flag VERO quando in attesa di un prodotto dalla macchina a monte. |
| IsAlarmActive         | `BOOL`    | Flag VERO quando un qualsiasi allarme macchina è attivo.  |

### ⚙️ Flag di Handshake e Controllo

| Nome Variabile          | Tipo Dati | Descrizione |
|-------------------------|-----------|-------------|
| AckChangeRecipe         | `BOOL`    | Conferma (Ack) del PLC a un comando di cambio ricetta. |
| RemoteControlEnable     | `BOOL`    | Flag che indica se il controllo remoto da SCADA è abilitato. |
| ProductionChangeOK      | `BOOL`    | Conferma del PLC che il cambio produzione è avvenuto con successo. |
| RecipeChangeOK          | `BOOL`    | Conferma del PLC che il cambio ricetta è avvenuto con successo. |
| RecipeChangeReject      | `BOOL`    | Flag che indica che il cambio ricetta è stato rifiutato dall'Operatore. |
| RecipeChangePostpone    | `BOOL`    | Flag che indica che il cambio ricetta è stato rimandato dall'Operatore. |
| MesCommunicationFault   | `BOOL`    | Flag VERO se c'è un errore di comunicazione con il MES. |

### ⚙️ Informazioni Ricetta e Produzione

| Nome Variabile           | Tipo Dati     | Descrizione |
|--------------------------|---------------|-------------|
| ActualRecipeIndex        | `DINT`        | Indice della ricetta attualmente attiva. |
| ActualRecipeName         | `STRING[38]`  | Nome della ricetta attualmente attiva. |
| ActualProductionInfo     | `STRING[38]`  | Descrizione del lotto/ordine di produzione attuale. |
| ActualProductionCode     | `DINT`        | Codice del lotto/ordine di produzione attuale. |
| MachineStatus            | `DINT`        | Codice di stato generale della macchina (come da visualizzazione HMI). |

### ⚙️ Watchdog di Comunicazione

| Nome Variabile | Tipo Dati | Descrizione |
|----------------|-----------|-------------|
| PlcWatchdog    | `DINT`    | Contatore di watchdog del PLC inviato allo SCADA. |

### ⚙️ Strutture Dati di Analisi

| Nome Variabile         | Tipo Dati                     | Descrizione |
|------------------------|-------------------------------|-------------|
| TimeAnalytics          | `ST_MachineTimers`            | Statistiche dettagliate basate sul tempo. |
| ProductionAnalytics    | `ST_ProductionAnalytics`      | Statistiche dettagliate basate sulla produzione. |

### ⚙️ Dati Allarmi

| Nome Variabile             | Tipo Dati                           | Descrizione |
|----------------------------|-------------------------------------|-------------|
| AlarmAnalytics             | `ARRAY[0..1399] OF ST_AlarmAnalytics` | Dati analitici per ogni singolo allarme. |
| TopAlarms_ByFrequency      | `ARRAY[0..99] OF ST_TopAlarmEntry`    | Classifica degli allarmi più frequenti. |
| TopAlarms_ByDowntime       | `ARRAY[0..99] OF ST_TopAlarmEntry`    | Classifica degli allarmi che causano più downtime. |
| Alarms_Packed              | `ARRAY[0..80] OF WORD`               | Array compatto per visualizzazione rapida degli allarmi. |

---

## ⚙️ Struttura `ST_Ingress` (SCADA → PLC)

Questa struttura contiene tutti i comandi e i setpoint che il sistema SCADA può inviare al PLC.

### ⚙️ Comandi di Controllo Produzione

| Nome Variabile         | Tipo Dati | Descrizione |
|------------------------|-----------|-------------|
| ProductionChangeRequest| `BOOL`    | Comando da SCADA per richiedere un cambio produzione/lotto. |
| RecipeChangeRequest    | `BOOL`    | Comando da SCADA per richiedere un cambio ricetta. |
| ResetCounters          | `BOOL`    | Comando da SCADA per resettare le statistiche. |
| RemoteStopMachine      | `BOOL`    | Comando da SCADA per arrestare la macchina da remoto. |

### ⚙️ Richieste Dati Ricetta e Produzione

| Nome Variabile            | Tipo Dati    | Descrizione |
|---------------------------|--------------|-------------|
| RequestRecipeIndex        | `DINT`       | Indice della ricetta richiesta. |
| RequestProductionQuantity | `DINT`       | Quantità di produzione richiesta. |
| RequestProductionCode     | `DINT`       | Codice del lotto/ordine di produzione richiesto. |
| RequestProductionInfo     | `STRING[38]` | Descrizione del lotto/ordine richiesta. |

### ⚙️ Watchdog di Comunicazione

| Nome Variabile  | Tipo Dati | Descrizione |
|------------------|-----------|-------------|
| ScadaWatchdog    | `DINT`    | Contatore di watchdog dello SCADA ricevuto dal PLC. |
