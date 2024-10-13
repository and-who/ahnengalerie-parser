import React from "react";
import { AhnenPage } from "./pages/ahnen-page";

const App = () => (
  <div>
    <h1>Ahnengalerie to GEDCOM Converter</h1>
    <p>
      Years ago I received data from my grandfather about his genealogy.
      Unfortunately, these files could no longer be read by any modern computer.
      The program was called “Ahnengalerie”. Since I would hate to lose this
      data, I analyzed the file format and wrote a parser. It may not work
      perfectly, but I was able to convert my data into the common GEDCOM
      format. Maybe it will help someone else.
    </p>

    <h2>Usage</h2>
    <p>
      In the “Ancestor Gallery” program, the family trees were saved in files
      beginning with the word “FICHES”. For example “FICHES.006”. You can enter
      this file here on the page in the file input. If successful, you will see
      a list with the data and a button to export.
    </p>

    <h2>Donation</h2>
    <p>
      If you had success with the parser and want to thank me for it, you are
      welcome to buy me lunch ;) My Paypal link is:
      <a href="https://paypal.me/andreaswolf">paypal.me/andreaswolf</a>I would
      be happy about a little message.
    </p>

    <h2>Disclaimer</h2>
    <p>
      I have written this parser for myself. The data is not sent to any server.
    </p>

    <AhnenPage />
  </div>
);

export { App };
