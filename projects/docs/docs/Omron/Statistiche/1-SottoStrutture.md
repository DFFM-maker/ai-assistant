---
id: SottoStrutture
sidebar_position: 1
title: Sotto Struttura ScadaInterface
sidebar_label: Scada Interface Sotto Strutture
pagination_prev: null
hide_table_of_contents: true
---

## Sotto-Strutture di `ScadaInterface`

Questa sezione descrive in dettaglio le strutture dati "mattoncino" utilizzate all'interno dell'interfaccia SCADA.

### Struttura `ST_StateStatistics`

Questa è la struttura base per l'analisi dei tempi. Contiene i dati calcolati per un **singolo stato macchina** (es. Marcia, Arresto, etc.). Viene riutilizzata per ogni stato che si desidera monitorare.

| Nome Variabile | Tipo Dati | Descrizione |
| :--- | :--- | :--- |
| `Hours` | `DINT` | Le ore totali accumulate per lo stato. |
| `Minutes` | `DINT` | I minuti totali accumulati per lo stato (0-59). |
| `Percentage` | `DINT` | La percentuale del tempo totale in cui lo stato è stato attivo. Il valore è un intero con due decimali fissi (es. `1234` rappresenta `12.34%`). |

### Struttura `ST_MachineTimers`

Questa struttura raggruppa tutte le analisi dei tempi in un unico blocco, rendendo i dati facili da navigare per lo SCADA. Ogni membro di questa struttura è del tipo `ST_StateStatistics` definito sopra.

| Nome Variabile | Tipo Dati | Descrizione |
| :--- | :--- | :--- |
| `TotalTime` | `ST_StateStatistics` | Contiene il tempo totale di monitoraggio. La percentuale di questo stato è sempre 100%. |
| `RunTime` | `ST_StateStatistics` | Contiene i dati relativi al tempo in cui la macchina è stata in marcia (`Running`). |
| `StopTime` | `ST_StateStatistics` | Contiene i dati relativi al tempo in cui la macchina è stata in arresto (`Stopped`). |
| `EmergencyTime` | `ST_StateStatistics` | Contiene i dati relativi al tempo in cui la macchina è stata in emergenza (`Emergency`). |
| `DownstreamTime` | `ST_StateStatistics` | Contiene i dati relativi al tempo passato in attesa di un segnale dalla macchina a valle. |
| `UpstreamTime` | `ST_StateStatistics` | Contiene i dati relativi al tempo passato in attesa di un prodotto dalla macchina a monte. |