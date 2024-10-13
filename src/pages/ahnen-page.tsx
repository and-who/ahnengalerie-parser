import React from "react";
import { FileInput } from "../components/file-input";
import { Entry } from "../utils/ahnen-file-util";
import { GenealogyViewer } from "../components/genealogy-viewer";
import { generateGedcom } from "../utils/gedcom-utils";

export const AhnenPage = () => {
  const [entries, setEntries] = React.useState<Entry[]>([]);

  // entries grouped by Birth Year
  const entriesByYear = entries.reduce<{ [id: string]: Entry[] }>(
    (acc, entry) => {
      const year = entry.birthday?.year || "unknown";

      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(entry);

      return acc;
    },
    {}
  );

  // console.log({ entriesByYear });

  let possibledDuplicates: {
    [year: string]: {
      [name: string]: {
        [sourceId: string]: Entry[];
      };
    };
  } = {};

  const entriesByName = Object.values(entriesByYear).forEach((group) => {
    group.forEach((entry) => {
      const sanatizedName = ("" + entry.name).replace(/[^a-zA-Z0-9]/g, " ");
      const nameArray = sanatizedName.split(" ");
      const sureName = nameArray[nameArray.length - 1];
      if (!possibledDuplicates[entry.birthday?.year || "unknown"]) {
        possibledDuplicates[entry.birthday?.year || "unknown"] = {};
      }
      if (!possibledDuplicates[entry.birthday?.year || "unknown"][sureName]) {
        possibledDuplicates[entry.birthday?.year || "unknown"][sureName] = {};
      }
      if (
        !possibledDuplicates[entry.birthday?.year || "unknown"][sureName][
          entry.sourceId || "undefined"
        ]
      ) {
        possibledDuplicates[entry.birthday?.year || "unknown"][sureName][
          entry.sourceId || "undefined"
        ] = [];
      }
      possibledDuplicates[entry.birthday?.year || "unknown"][sureName][
        entry.sourceId || "undefined"
      ].push(entry);
    });
  });

  // console.log({ possibledDuplicates });

  const filteredDuplicates: { [source: string]: Entry[] }[] = [];

  Object.values(possibledDuplicates).forEach((yearData) => {
    Object.values(yearData).forEach((nameData) => {
      if (Object.values(nameData).length > 1) {
        filteredDuplicates.push(nameData);
      }
    });
  });

  const downloadGedcomButton = () => {
    const downloadGedcom = () => {
      const element = document.createElement("a");
      const file = new Blob([generateGedcom(entries)], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "genealogy.ged";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    };

    return <button onClick={downloadGedcom}>Download GEDCOM File</button>;
  };

  return (
    <div>
      <h2>Ahnengalerie to GEDCOM Converter:</h2>
      <FileInput
        onEntriesParsed={(newEntries) =>
          setEntries([...entries, ...newEntries])
        }
      />
      {entries.length > 0 && downloadGedcomButton()}
      {entries.length > 0 && <GenealogyViewer entries={entries} />}
      {filteredDuplicates.map((duplicates) => {
        return (
          <div>
            {Object.values(duplicates).map((sourceEntries) => {
              return (
                <div>
                  {sourceEntries.map((entry) => {
                    return (
                      <div>
                        <pre>{JSON.stringify(entry, null, 2)}</pre>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
