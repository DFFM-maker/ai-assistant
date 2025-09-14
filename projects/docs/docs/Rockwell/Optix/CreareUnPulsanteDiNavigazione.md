---
sidebar_position: 3
hide_table_of_contents: true
title: Creare un pulsante di navigazione
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 🔘 Creare un Pulsante di Navigazione

Hai creato la tua nuova pagina (bravo! 👏), ma ora serve un modo per arrivarci, no? È il momento di aggiungere un **pulsante di navigazione**.

In questa guida vedremo come creare un pulsante per navigare da una schermata all’altra utilizzando i **componenti custom** messi a disposizione nel progetto Optix.

---

## 🧭 Principio di funzionamento

I pulsanti di navigazione disponibili sono diversi, ma condividono **lo stesso principio base**:

> 🎯 A ogni pulsante viene associata una **pagina di destinazione** tramite il parametro `Panel`.

---

## 🧮 Tipi di pulsanti di navigazione

A seconda del contesto in cui ti trovi, scegli il **template più adatto** tra quelli disponibili. Ogni pulsante è pensato per uno scenario d’uso specifico.

| Template                     | Descrizione |
|-----------------------------|-------------|
| `tpAxHomeButton`            | 🔁 Pulsante per il comando di **azzeramento di un singolo asse** |
| `tpDualAxHomeButton`        | 🔀 Variante del precedente, consente l'**azzeramento simultaneo di più assi**. Utile quando gli azzeramenti devono essere coordinati tra più assi. |
| `tpButtNavigationLateral`   | 🧭 Pulsante da utilizzare nel **menù laterale principale** dell’interfaccia (quello sempre visibile sulla sinistra). Garantisce coerenza visiva e funzionale. |
| `tpButtNavigationSetup`     | ⚙️ Pulsante standard per la **navigazione nelle pagine di setup**. Ha uno stile neutro e coerente con l’ambiente di configurazione. |
| `tpButtNavigationAdvMenu`   | 🧩 Pulsante progettato per i **menù a griglia** come il menù avzato o vari sottomenù o con layout esplorativi. Ideale per strutture ad accesso rapido o dinamico. |
| `tpButtNavigationDiagnostic`| 🧯 Pulsante per la **navigazione alle pagine di diagnostica**. Include un **badge di stato** che può mostrare la presenza di un fault o anomalia. |

> 💡 **Suggerimento**: usa il pulsante giusto per ogni contesto. Non è solo una questione estetica: migliora l’usabilità e rende l’interfaccia più intuitiva per l’operatore.

---

## 🛠️ Come crearne uno

Per inserire un nuovo pulsante di navigazione:

1. **Fai clic destro** sul contenitore in cui desideri aggiungerlo (può essere una `Panel`, una `GroupBox`, ecc.).
2. Seleziona:  
   `New > tpTemplates > tpButtons > Navigation > <tipo desiderato>`

📷 *Esempio:*

<img src={useBaseUrl('/img/screenshots/optix/create-navigation-button.jpg')} alt="Creazione pulsante di navigazione" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '1rem' }} />

---

## ⚙️ Parametrizzazione del pulsante

Dopo aver creato il pulsante, selezionalo e imposta la **pagina di destinazione**:

1. Vai nel menu delle **proprietà a sinistra**
2. Trova il parametro `Panel`
3. Seleziona la pagina a cui vuoi che il pulsante navighi

📷 *Esempio:*

<img src={useBaseUrl('/img/screenshots/optix/parametrize-navigation-button.jpg')} alt="Parametri del pulsante di navigazione" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '1rem' }} />

---

## 🚀 E ora?

Fatto! A questo punto, il tuo pulsante è operativo: durante il runtime, cliccandoci sopra, l’utente verrà portato direttamente alla pagina che hai configurato.

---

> 🧙‍♂️ **Pro tip**: dai un nome chiaro al tuo pulsante e alla pagina di destinazione. Ti ringrazierai tra qualche progetto, fidati.

---

## ✅ Conclusione

Creare pulsanti di navigazione è semplice e potente. Ti permette di costruire un'esperienza utente fluida, organizzata e professionale, mantenendo la coerenza con il resto dell'interfaccia.

E poi... vuoi mettere la soddisfazione di cliccare su un bottone che *funziona davvero*?

🚪➡️ *Vai e clicca, l’interfaccia ti aspetta!*
