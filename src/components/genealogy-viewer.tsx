import React from "react";
import { Entry } from "../utils/ahnen-file-util";
import "./genealogy-viewer.scss";

//https://projectstorm.gitbook.io/react-diagrams/getting-started/using-the-library
//https://github.com/ErikGartner/dTree

export const EntryReference = (props: { entry?: Entry }) => {
  if (!props.entry) {
    return <span>None</span>;
  }
  return (
    <a href={`#${props.entry.id}`}>{`${props.entry.id} ${props.entry.name}`}</a>
  );
};

export const GenealogyViewer = (props: { entries: Entry[] }) => {
  const { entries } = props;

  return (
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Birthday</th>
          <th>Birth Place</th>
          <th>Death Date</th>
          <th>Death Place</th>
          <th>Gender</th>
          <th>Job</th>
          <th>Religion</th>
          <th>Mother</th>
          <th>Father</th>
          <th>Children</th>
          <th>Relationships</th>
          <th>Picture Reference</th>
          <th>Comment</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const mother = entries.find(
            (element) => element.id === entry.motherReference
          );
          const father = entries.find(
            (element) => element.id === entry.fatherReference
          );
          return (
            <tr id={`${entry.id}`}>
              <td>{entry.id}</td>
              <td>{entry.name}</td>
              <td>
                {entry.birthday &&
                  `${entry.birthday?.day}.${entry.birthday?.month}.${entry.birthday?.year}`}
              </td>
              <td>{entry.birthPlace}</td>
              <td>
                {entry.deathDate &&
                  `${entry.deathDate?.day}.${entry.deathDate?.month}.${entry.deathDate?.year}`}
              </td>
              <td>{entry.deathPlace}</td>
              <td>{entry.gender}</td>
              <td>{entry.job}</td>
              <td>{entry.religion}</td>
              <td>
                <EntryReference entry={mother} />
              </td>
              <td>
                {" "}
                <EntryReference entry={father} />
              </td>
              <td>
                <ul>
                  {entry.children?.map((child) => {
                    const childEntry = entries.find(
                      (element) => element.id === child.childReference
                    );
                    return (
                      <li>
                        <EntryReference entry={childEntry} />
                        {` (rel: ${child.relationshipIndex})`}
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td>
                <ul>
                  {entry.relationships?.map((relationship) => {
                    const partner = entries.find(
                      (element) => element.id === relationship.partnerReference
                    );
                    return (
                      <li>
                        <EntryReference entry={partner} />
                        {relationship.date &&
                          ` ${relationship.date?.day}.${relationship.date?.month}.${relationship.date?.year}`}
                        {relationship.place && ` ${relationship.place}`}
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td>{entry.pictureReference}</td>
              <td>{entry.comment}</td>
              <td>{entry.note}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
