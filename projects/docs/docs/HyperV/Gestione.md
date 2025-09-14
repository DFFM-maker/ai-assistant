---
id: Gestione1
sidebar_position: 1
title: Gestione VM Hyper-V
sidebar_label: Hyper-V
pagination_prev: null
hide_table_of_contents: true
---

### 🖥️ Gestione VM Hyper-V

🎨 Guida passo-passo per configurare e gestire macchine virtuali Hyper-V

💡 **L’obiettivo:** avere un ambiente pronto per import/export VM e gestione dischi senza errori

Questa guida è pensata per sviluppatori e amministratori di sistema che necessitano di un ambiente Hyper-V organizzato e efficiente per la gestione delle macchine virtuali.

---

### 0️⃣ Installazione e Rimozione di Hyper-V

Prima di iniziare, è fondamentale avere un'installazione pulita di Hyper-V.

#### **Installazione di Hyper-V (se non presente)**

1.  Apri **PowerShell come Amministratore**.
2.  Esegui il comando seguente per installare tutti i componenti di Hyper-V:
    ```powershell
    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -All -NoRestart
    ```
3.  Al termine, **riavvia il computer** per completare l'installazione.

#### **Rimozione di versioni precedenti o corrotte (Opzionale)**

Se sospetti un'installazione problematica, puoi eseguire una pulizia completa.

1.  Apri **PowerShell come Amministratore**.
2.  Esegui il comando per disabilitare e rimuovere tutte le funzionalità di Hyper-V:
    ```powershell
    Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -NoRestart
    ```
:::danger Attenzione
Questo comando rimuove tutti i componenti di Hyper-V. Sarà necessario un riavvio per completare la disinstallazione.
:::

---

### 1️⃣ Requisiti Software

Per seguire questa guida è necessario avere un ambiente PowerShell moderno e correttamente configurato.

:::info Prerequisito
Se non hai ancora installato e configurato PowerShell 7, segui prima la nostra guida dedicata.

➡️ **[Guida alla Configurazione dell'Ambiente PowerShell](./configurazione-ambiente-powershell.md)**
:::

* **Script `VmManage.ps1`**
    Questo strumento facilita le operazioni di import ed export.
    * **Percorso di rete:** `\\tecnopack.local\sviluppo\Virtuale_Machines\Virtual_Machine-Hyper-V\VMScript\VmManage.ps1`

---

### 2️⃣ Configurazione dei Commutatori Virtuali (Virtual Switch)

I commutatori virtuali sono essenziali per connettere le VM alla rete.

#### **Rimozione sicura dei Virtual Switch esistenti**

Per evitare conflitti, è consigliabile rimuovere le configurazioni precedenti.

1.  Apri **PowerShell come Amministratore**.
2.  Elenca gli switch esistenti per verificarli:
        ```powershell
        Get-VMSwitch
        ```
3.  Assicurati che tutte le VM siano spente.
4.  Rimuovi tutti gli switch con un singolo comando:
    ```powershell
    Get-VMSwitch | Remove-VMSwitch -Force
    ```

#### **Creazione dei nuovi Commutatori**

1.  Apri **Gestione Hyper-V** dal menu Start.
2.  Nel pannello Azioni a destra, clicca su **Gestione commutatori virtuali...**.

* **Commutatore 1: Wifi**
    * **Tipo:** Esterno
    * **Scheda di rete:** Seleziona la tua scheda di rete Wi-Fi.
    * **Scopo:** Permette alle VM di connettersi tramite la rete wireless.
    <br/>
    <img src="/img/screenshots/hyperv/switch_wifi.jpg" alt="Configurazione Commutatore Wifi" style={{ maxWidth: '60%', borderRadius: '8px' }} />

* **Commutatore 2: LAN**
    * **Tipo:** Esterno
    * **Scheda di rete:** Seleziona la tua scheda di rete cablata (Ethernet).
    * **Scopo:** Permette alle VM di connettersi tramite la rete cablata.
    <br/>
    <img src="/img/screenshots/hyperv/switch_lan.jpg" alt="Configurazione Commutatore LAN" style={{ maxWidth: '60%', borderRadius: '8px' }} />

---

### 3️⃣ Impostazioni dei Percorsi di Hyper-V

Una corretta organizzazione dei file previene problemi futuri. Imposta questi percorsi **prima** di creare o importare VM.

* **Dischi rigidi virtuali:** `D:\VMs`
* **Macchine virtuali:** `D:\VMs`

:::tip
Usare una cartella radice unica come `D:\VMs` per dischi e configurazioni semplifica il backup e la gestione. Hyper-V creerà automaticamente sottocartelle con i nomi delle VM.
:::

---

### 4️⃣ 🚀 Utilizzo dello script `VmManage.ps1`

Questo script automatizza le operazioni di esportazione e importazione.

#### **4.1 Preparazione**

1.  Copia l'intera cartella `VMScript` in una directory locale (es. `Documenti`).
2.  Apri **PowerShell 7 come Amministratore**.
3.  Naviga nella cartella dove hai copiato lo script:
    ```powershell
    cd ~\Documenti\VMScript
    ```

#### **4.2 Abilitazione ed Esecuzione dello Script**

Per motivi di sicurezza, PowerShell blocca l'esecuzione di script di default. Per abilitare l'esecuzione solo per la sessione corrente, esegui questo comando:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
:::info Nota
Questo comando imposta il criterio di esecuzione solo per la finestra di PowerShell corrente. Una volta chiusa, la policy tornerà al suo valore predefinito. È una pratica sicura per eseguire script attendibili.
:::

Ora, esegui lo script:

```powershell
.\VmManage.ps1
```
Lo script mostrerà un menu interattivo per scegliere l'operazione.
<img src="/img/screenshots/hyperv/Script1.jpg" alt="Menu principale dello script" style={{ maxWidth: '70%', borderRadius: '8px' }} />

Export (E): Spegne la VM, ne crea una copia in una cartella con timestamp (es. VM_Export_2023-10-27_10-30-00), e la riavvia. Ideale per creare backup sicuri.
<img src="/img/screenshots/hyperv/ScriptE.jpg" alt="Processo di Esportazione" style={{ maxWidth: '70%', borderRadius: '8px' }} />

Import (I): Ti guida nell'importazione di una VM, chiedendoti un nuovo nome e la cartella di destinazione. Controlla lo spazio su disco prima di iniziare.
<img src="/img/screenshots/hyperv/ScriptI.jpg" alt="Processo di Importazione" style={{ maxWidth: '70%', borderRadius: '8px' }} />

4.3 Note Pratiche
✅ Esegui sempre PowerShell come Amministratore.

✅ Mantieni i percorsi delle VM organizzati come configurato al punto 3.

✅ Scegli nomi chiari e descrittivi per le VM importate.

🔗 Risorse Utili
Documentazione ufficiale Hyper-V di Microsoft: Per approfondimenti e risoluzione di problemi.