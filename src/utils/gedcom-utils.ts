import { Entry, UncompleteDate } from "./ahnen-file-util";

const generateGedcomHeader = () => {
  return `0 HEAD
1 SOUR Andreas Wolf
2 VERS 1
2 NAME Andreas Wolf
2 EMAIL genealogy@wolfandreas.com
1 DATE 13 Oct 2024
1 GEDC
2 VERS 5.5
2 FORM LINEAGE-LINKED
1 CHAR UTF-8
`;
};

const generateGedcomFooter = () => {
  return `0 TRLR
`;
};

const monthArray = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const generateDate = (date: UncompleteDate) => {
  let dateStringArray: string[] = [];

  if (date.day) {
    dateStringArray.push(`${date.day}`);
  }

  if (date.month) {
    dateStringArray.push(monthArray[date.month - 1]);
  }

  if (date.year) {
    dateStringArray.push(`${date.year}`);
  }

  return dateStringArray.join(" ");
};

const generateIndividual = (entry: Entry, famlies: Family[]) => {
  const parentFamily = famlies.find((family) => {
    return family.childrenIds?.includes(entry.id as string);
  });

  const relationshipFamilies = famlies.filter((family) => {
    return family.husbandId === entry.id || family.wifeId === entry.id;
  });

  let individualString = `0 @I${entry.id}@ INDI \n`;
  if (entry.name) {
    const nameArray = entry.name.split(" ");
    const sureName = nameArray[0];
    let givenName = nameArray.slice(1).join(" ");
    // replace all non-alphanumeric characters with a space
    const sanatizedGivenName = givenName.replace(/[,;]/g, " ");

    individualString += `1 NAME ${sanatizedGivenName} /${sureName}/ \n`;
  }

  if (entry.birthday || entry.birthPlace) {
    individualString += `1 BIRT \n`;
    if (entry.birthday) {
      individualString += `2 DATE ${generateDate(entry.birthday)} \n`;
    }
    if (entry.birthPlace) {
      individualString += `2 PLAC ${entry.birthPlace} \n`;
    }
  }
  if (entry.deathDate || entry.deathPlace) {
    individualString += `1 DEAT \n`;
    if (entry.deathDate) {
      individualString += `2 DATE ${generateDate(entry.deathDate)} \n`;
    }
    if (entry.deathPlace) {
      individualString += `2 PLAC ${entry.deathPlace} \n`;
    }
  }
  if (entry.gender) {
    individualString += `1 SEX ${entry.gender === "male" ? "M" : "F"} \n`;
  }

  if (entry.religion) {
    individualString += `1 RELI ${entry.religion} \n`;
  }

  if (entry.job) {
    individualString += `1 OCCU ${entry.job} \n`;
  }

  if (entry.note) {
    individualString += `1 NOTE \n`;
    const senatizedNote = entry.note.replace(/[\n\r]/g, " ");
    individualString += `2 CONT ${senatizedNote} \n`;
  }
  if (entry.comment) {
    individualString += `1 NOTE \n`;
    const senatizedNote = entry.comment.replace(/[\n\r]/g, " ");
    individualString += `2 CONT ${senatizedNote} \n`;
  }
  if (entry.pictureReference) {
    individualString += `1 NOTE \n`;
    const senatizedNote = entry.pictureReference.replace(/[\n\r]/g, " ");
    individualString += `2 CONT ${senatizedNote} \n`;
  }

  if (parentFamily) {
    individualString += `1 FAMC @F${parentFamily.id}@ \n`;
  }

  relationshipFamilies.forEach((relationshipFamily) => {
    individualString += `1 FAMS @F${relationshipFamily.id}@ \n`;
  });

  return individualString;
};

type Family = {
  id?: string;
  husbandId?: string;
  wifeId?: string;
  childrenIds?: string[];
  marriageDate?: UncompleteDate;
  marriagePlace?: string;
};

const generateFamilies = (entries: Entry[]) => {
  const families: Family[] = [];

  entries.forEach((entry) => {
    if (entry.relationships) {
      entry.relationships.forEach((relationship) => {
        const familyIndex = families.findIndex((family) => {
          return (
            (family.husbandId === entry.id &&
              family.wifeId === relationship.partnerReference) ||
            (family.wifeId === entry.id &&
              family.husbandId === relationship.partnerReference)
          );
        });
        const family: Family = familyIndex !== -1 ? families[familyIndex] : {};
        if (entry.gender === "male") {
          family.husbandId = entry.id;
          family.wifeId = relationship.partnerReference;
        } else {
          family.wifeId = entry.id;
          family.husbandId = relationship.partnerReference;
        }
        if (relationship.date && !family.marriageDate) {
          family.marriageDate = relationship.date;
        }
        if (relationship.place && !family.marriagePlace) {
          family.marriagePlace = relationship.place;
        }
        if (familyIndex === -1) {
          families.push(family);
        } else {
          families[familyIndex] = family;
        }
      });

      if (entry.id && (entry.motherReference || entry.fatherReference)) {
        const familyIndex = families.findIndex((family) => {
          return (
            (family.husbandId === entry.fatherReference &&
              family.wifeId === entry.motherReference) ||
            (family.wifeId === entry.fatherReference &&
              family.husbandId === entry.motherReference)
          );
        });
        const family: Family = familyIndex !== -1 ? families[familyIndex] : {};
        family.childrenIds = family.childrenIds || [];
        family.childrenIds.push(entry.id);
        family.wifeId = entry.motherReference;
        family.husbandId = entry.fatherReference;
        if (familyIndex === -1) {
          families.push(family);
        } else {
          families[familyIndex] = family;
        }
      }
    }
  });

  const familiesWithIDs = families.map((family, index) => {
    return { ...family, id: `${index + 1}` };
  });

  return familiesWithIDs;
};

const generateFamily = (family: Family) => {
  let familyString = `0 @F${family.id}@ FAM \n`;

  if (family.husbandId && family.husbandId !== "0") {
    familyString += `1 HUSB @I${family.husbandId}@ \n`;
    console.log({ husb: family.husbandId });
  }

  if (family.wifeId && family.wifeId !== "0") {
    familyString += `1 WIFE @I${family.wifeId}@ \n`;
  }

  if (family.marriageDate || family.marriagePlace) {
    familyString += `1 MARR \n`;
    if (family.marriageDate) {
      familyString += `2 DATE ${generateDate(family.marriageDate)} \n`;
    }
    if (family.marriagePlace) {
      familyString += `2 PLAC ${family.marriagePlace} \n`;
    }
  }

  if (family.childrenIds) {
    family.childrenIds.forEach((childId) => {
      familyString += `1 CHIL @I${childId}@ \n`;
    });
  }

  return familyString;
};

export const generateGedcom = (entries: Entry[]) => {
  let gedcomString = generateGedcomHeader();

  const families = generateFamilies(entries);
  console.log({ families });

  entries.forEach((entry) => {
    gedcomString += generateIndividual(entry, families);
  });

  families.forEach((family) => {
    gedcomString += generateFamily(family);
  });

  gedcomString += generateGedcomFooter();

  return gedcomString;
};
