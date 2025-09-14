---
title: IOCardConfig
---

# 📦 Configurazione delle Schede IO (IOCardConfig)

La configurazione delle schede IO è un elemento fondamentale per il corretto funzionamento del sistema.  

Questa configurazione descrive tutte le caratteristiche delle schede Input/Output (IO) che possono essere sia normali sia di sicurezza (safety), e viene fornita in un file YAML che viene poi letto e interpretato dal software.

---

## 🧩 Struttura generale della configurazione

La configurazione è organizzata in due sezioni principali:

- **NormalIoCards**: contiene la definizione delle schede IO normali.  
- **SafetyIoCards**: contiene la definizione delle schede IO di sicurezza.

Ogni sezione è composta da un insieme di schede, ognuna identificata da un nome univoco (ad esempio `AB:1734_DI8:C:0:`). Per ogni scheda sono definiti i seguenti elementi:

| Proprietà     | Descrizione                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------|
| **type**      | Tipo generico della scheda (es. IB8, OB8, IT2I) che indica la funzione o famiglia della scheda.|
| **nodeType**  | Nome del template grafico usato per rappresentare la scheda nell’interfaccia utente.           |
| **iODirection** | Direzione IO, indica se la scheda è di tipo input ("I") o output ("O").                       |
| **colors**    | Definizione dei colori usati nella UI per la scheda e i suoi LED (acceso/spento).               |

---

## ⚠️ Specifiche per le schede di sicurezza (SafetyIoCards)

Le schede di sicurezza hanno una proprietà in più rispetto a quelle normali:

- **outputType**: indica il tipo di output associato alla scheda di sicurezza (es. `AB:1734_IB8S:O:0`).  
  Serve a collegare la scheda di input safety con il suo corrispettivo output, necessario per la logica di sicurezza.

---

## 🎨 Dettaglio sui colori

La sezione `colors` permette di personalizzare l’aspetto della scheda nell’interfaccia grafica, con valori numerici che rappresentano i colori:

- **card**: colore principale della scheda.  
- **led_on**: colore del LED quando è acceso (es. LED verde acceso).  
- **led_off**: colore del LED quando è spento (es. LED rosso spento).

---

## 📝 Esempio pratico di configurazione YAML

```yaml
normalIoCards:
  AB:1734_DI8:C:0:
    type: IB8
    nodeType: IOCard_8B
    iODirection: I
    colors:
      card: 0xff1b83df
      led_on: 0xff00fa7e
      led_off: 0xff0f4d29

  AB:1734_DOB8:C:0:
    type: OB8
    nodeType: IOCard_8B
    iODirection: O
    colors:
      card: 0xff40aa84
      led_on: 0xffea2e2e
      led_off: 0xff500f0f

safetyIoCards:
  AB:1734_IB8S_Safety2:I:0:
    outputType: AB:1734_IB8S:O:0
    type: IB8S
    nodeType: IOCard_8BS
    iODirection: I
    colors:
      card: 0xffe4564b
      led_on: 0xff00fa7e
      led_off: 0xff0f4d29
```