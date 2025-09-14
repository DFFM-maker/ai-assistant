---
sidebar_position: 2
hide_table_of_contents: true
title: Creare una nuova pagina
---

import useBaseUrl from '@docusaurus/useBaseUrl';

## 🛠️ Creare una nuova pagina in Optix

Creare una nuova pagina nel progetto **Optix** è molto semplice, ma richiede l’uso di un tipo derivato, non della pagina base standard. Questo perché la nostra struttura adotta proprietà estese per funzionalità avanzate.

---

### 📁 Dove creare la pagina

Per iniziare:

1. Fai **clic destro** sulla cartella `Screens` o su una delle sue sottocartelle.
2. Seleziona:  
   `New > All > User interface > tpTemplates > tpScreens > tpBaseScreen`

<img src={useBaseUrl('img/screenshots/optix/createBasePage.jpg')} alt="Creazione pagina base in Optix" style={{ maxWidth: '100%', marginTop: '1rem', borderRadius: '8px' }} />

---

### ⚙️ Parametri fondamentali

Una volta creata la pagina, selezionala dal menu laterale e configura i seguenti parametri nel pannello di sinistra:

| **Parametro** | **Descrizione** |
|---------------|-----------------|
| `PageNumber`  | Il numero identificativo univoco della pagina. Serve sia alla documentazione che alla navigazione gestita da PLC. **Deve essere univoco!** |
| `PageName`    | Il nome della pagina. È un campo di tipo **Localized Text**, quindi può essere collegato al dizionario delle traduzioni. Verrà visualizzato insieme al `PageNumber` nell’**Header** del pannello. |
| `PageType`    | Definisce il tipo di pagina tramite un **enumeratore**. Questo valore influisce sul colore dell’header e sulla logica di accesso. |
| `Father`      | Indica la **pagina padre**, ovvero quella a cui tornare premendo "indietro" nell’header del pannello. |

---

### 🧭 PageType — Elenco dei tipi disponibili

Qui sotto trovi l’elenco dei valori disponibili per `PageType`:

| **Valore** | **Display Name**         |
|------------|--------------------------|
| 0          | Home                     |
| 1          | Menù                     |
| 2          | Allarmi                  |
| 3          | Modalità operativa       |
| 4          | Ricette                  |
| 5          | Abilitazioni             |
| 6–7        | --Reserved--             |
| 8          | Masse saldanti           |
| 9          | --Reserved--             |
| 10         | Mini setup               |
| 11         | Full setup               |
| 12         | Diagnostica              |
| 13–19      | --Reserved--             |
| 20         | Altro                    |

> ⚠️ Attenzione: I valori "Reserved" non devono essere utilizzati a meno di indicazioni specifiche da parte del team di sviluppo.

---

### ✅ Conclusione

Seguendo questi semplici passaggi, sarai in grado di creare una pagina completamente funzionale all’interno dell’ambiente Optix, con parametri ben configurati per garantire compatibilità, navigazione e coerenza visiva.

Grandi cose ti aspettano, giovane Padawan! 🧙‍♂️✨
