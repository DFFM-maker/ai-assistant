---
id: configurazione-ambiente-powershell
sidebar_position: 0
title: Configurazione Ambiente PowerShell per Sviluppo
sidebar_label: Ambiente PowerShell
pagination_prev: null
hide_table_of_contents: true
---


### 🖥️ Guida Rapida: Setup Ambiente di Sviluppo PowerShell

Questo documento descrive la procedura in due passaggi per configurare un ambiente di sviluppo PowerShell 7 completo, partendo da un'installazione pulita di Windows.

:::info Nota sulla Sicurezza e l'Accesso Offline
Questa procedura è stata progettata per garantire la massima sicurezza e conformità con le policy aziendali. Tutti i file di installazione necessari (Git, PowerShell 7, ecc.) vengono prelevati da una condivisione di rete interna sicura. In questo modo, non è richiesta una connessione a Internet durante il setup sul computer client e si evitano blocchi da parte dei sistemi di sicurezza come Fortinet, assicurando un'installazione rapida, offline e standardizzata.
:::

:::info Prerequisiti
1.  Accesso alla rete aziendale (per raggiungere lo script sulla condivisione).
2.  Un Personal Access Token (PAT) di GitLab con permessi di lettura sul repository.
:::
---

### **1️⃣ Eseguire lo Script di Bootstrap (Bootstrap-DevEnv.ps1)**

Questo primo script si occupa di installare Git e di clonare il repository con tutti gli strumenti necessari.

1. Apri una console Windows PowerShell. Non è necessario aprirla come Amministratore.

2. Copia lo script in locale. Per evitare problemi di sicurezza con l'esecuzione di script da percorsi di rete, il primo passo è copiare lo script in una cartella temporanea sul tuo PC. Esegui questo comando:
```powershell
Copy-Item -Path "\\tecnopack.local\sviluppo\utility\Bootstrap-DevEnv.ps1" -Destination "$env:TEMP\Bootstrap-DevEnv.ps1"
```
Esegui lo script locale. Ora, lancia la copia dello script che hai appena creato. Questo comando ignorerà temporaneamente i criteri di sicurezza solo per questa esecuzione.
```powershell
PowerShell -ExecutionPolicy Bypass -File "$env:TEMP\Bootstrap-DevEnv.ps1" -GitLabToken "IL_TUO_TOKEN_QUI"
```
:::danger Importante: 
Sostituisci "IL_TUO_TOKEN_QUI" con il tuo token GitLab personale che ti forniranno i Gitlab-Admin.
:::
---
### **2️⃣ Eseguire lo Script di Setup Finale (Setup-PowerShell7Dev.ps1)**

Una volta che il primo script ha terminato, il repository si troverà nella cartella Documenti. Ora puoi lanciare lo script che installerà e configurerà PowerShell 7, i font e il terminale.

Apri una nuova console PowerShell come amministratore.

Naviga nella cartella del repository appena clonato con il seguente comando:
```powershell
cd $env:USERPROFILE\Documents\Script\Repos\hyperv-vmscripts
```

Lancia lo script di setup:

```powershell
PowerShell -ExecutionPolicy Bypass -File ".\Setup-PowerShell7Dev.ps1"
```

Attendi che completi tutti i passaggi (installerà PowerShell 7, Oh My Posh, i font e aggiornerà le impostazioni di Windows Terminal).

### **️3️⃣ Completamento**

Al termine del secondo script, la configurazione è completa.

Chiudi tutte le finestre di PowerShell e riavvia Windows Terminal.

Dovresti trovare un nuovo profilo chiamato "PowerShell 7 - Dev" (o simile) che si avvia con la versione 7 e mostra il prompt personalizzato da Oh My Posh.

### **4️⃣ Impostare PowerShell 7 come predefinito**

Per evitare di usare la vecchia versione, impostala come predefinita in **Windows Terminal**.

1.  Apri **Windows Terminal**.
2.  Vai su **Impostazioni** (o `Ctrl + ,`).
3.  Nella sezione **Profilo di avvio**, seleziona "PowerShell" (icona scura).
    <img src="/img/screenshots/hyperv/wt-startup-profile.png" alt="Selezione del profilo di avvio" style={{ maxWidth: '70%', borderRadius: '8px' }} />
4.  **Salva** le modifiche.

---

#### **Prossimi Passi**

Ora che il tuo ambiente è pronto, puoi tornare alla guida per la gestione delle macchine virtuali.

➡️ **Vai alla [Guida alla Gestione di VM Hyper-V](./Gestione.md)**