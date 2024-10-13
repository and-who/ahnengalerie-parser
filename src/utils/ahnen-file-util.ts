export type UncompleteDate = { day?: number; month?: number; year?: number };

export type Entry = {
  id?: string;
  sourceId?: string;
  name?: string;
  birthday?: UncompleteDate;
  birthPlace?: string;
  religion?: string;
  deathDate?: UncompleteDate;
  deathPlace?: string;
  gender?: "male" | "female";
  job?: string;
  note?: string;
  motherReference?: string;
  fatherReference?: string;
  children?: { childReference?: string; relationshipIndex?: number }[];
  relationships?: {
    partnerReference?: string;
    date?: UncompleteDate;
    place?: string;
  }[];
  pictureReference?: string;
  comment?: string;
};

const createid = (id: number | string, sourceId?: string) => {
  if (id !== 0 && id && id !== "0") {
    return sourceId ? `${sourceId}_${id}` : `${id}`;
  }
};

const toUint16 = (byte1: number, byte2: number) => {
  return (byte2 << 8) | byte1;
};

const extractText = (intArray: Uint8Array, startIndex: number) => {
  const textLength = toUint16(intArray[startIndex], intArray[startIndex + 1]);
  const text: string | null = String.fromCharCode.apply(
    null,
    intArray.slice(startIndex + 2, startIndex + 2 + textLength)
  );
  return { text: text?.length ? text : undefined, textLength };
};

const extractDate = (intArray: Uint8Array, startIndex: number) => {
  let day: number | undefined = toUint16(
    intArray[startIndex],
    intArray[startIndex + 1]
  );
  let month: number | undefined = toUint16(
    intArray[startIndex + 2],
    intArray[startIndex + 3]
  );
  let year: number | undefined = toUint16(
    intArray[startIndex + 4],
    intArray[startIndex + 5]
  );

  if (
    (day === 0 && month === 0 && year === 0) ||
    (day === 65535 && month === 65535 && year === 65535)
  ) {
    return undefined;
  }
  if (day === 65535) {
    day = undefined;
  }
  if (month === 65535) {
    month = undefined;
  }
  if (year === 65535) {
    year = undefined;
  }

  return { day, month, year };
};

const extractChildren = (
  intArray: Uint8Array,
  startIndex: number,
  sourceId?: string
) => {
  const childrenLength = toUint16(
    intArray[startIndex],
    intArray[startIndex + 1]
  );
  let children: { childReference?: string; relationshipIndex?: number }[] = [];

  let cursorIndex = startIndex + 2;
  for (let i = 0; i < childrenLength; i++) {
    const childReference = createid(
      toUint16(intArray[cursorIndex], intArray[cursorIndex + 1]),
      sourceId
    );
    const relationshipIndex =
      toUint16(intArray[cursorIndex + 2], intArray[cursorIndex + 3]) - 1;
    children.push({ childReference, relationshipIndex });
    cursorIndex += 4;
  }
  return children;
};

const extractRelationships = (
  intArray: Uint8Array,
  startIndex: number,
  sourceId?: string
) => {
  const relationshipsLength = toUint16(
    intArray[startIndex],
    intArray[startIndex + 1]
  );
  let relationships: {
    partnerReference?: string;
    date?: UncompleteDate;
    place?: string;
  }[] = [];

  let cursorIndex = startIndex + 2;

  for (let i = 0; i < relationshipsLength; i++) {
    //Partner Reference
    const partnerReference = createid(
      toUint16(intArray[cursorIndex], intArray[cursorIndex + 1]),
      sourceId
    );

    cursorIndex += 4;

    // RelationshipDate
    const relationshipDate = extractDate(intArray, cursorIndex);
    cursorIndex += 10;

    const placeText = extractText(intArray, cursorIndex);
    relationships.push({
      partnerReference,
      date: relationshipDate,
      place: placeText.text,
    });
    cursorIndex += 2 + placeText.textLength;

    cursorIndex += 4;
  }
  return relationships;
};

const parseEntry = (entryIntArray: Uint8Array, sourceId?: string) => {
  let entryData: Entry = {
    sourceId,
  };
  let cursorIndex = 0;

  try {
    //Name
    const nameText = extractText(entryIntArray, cursorIndex);
    entryData.name = nameText.text;
    cursorIndex = cursorIndex + 2 + nameText.textLength;

    //Unknown
    cursorIndex += 2;

    //ID
    entryData.id = createid(
      toUint16(entryIntArray[cursorIndex], entryIntArray[cursorIndex + 1]),
      sourceId
    );
    cursorIndex += 2;

    //Unknown
    cursorIndex += 2;

    //comment
    const commentText = extractText(entryIntArray, cursorIndex);
    entryData.comment = commentText.text;
    cursorIndex = cursorIndex + 2 + commentText.textLength;

    //PictureReference
    const pictureReferenceText = extractText(entryIntArray, cursorIndex);
    entryData.pictureReference = pictureReferenceText.text;
    cursorIndex = cursorIndex + 2 + pictureReferenceText.textLength;

    //Job
    const jobText = extractText(entryIntArray, cursorIndex);
    entryData.job = jobText.text;
    cursorIndex = cursorIndex + 2 + jobText.textLength;

    //Unknown
    cursorIndex += 2;

    //Note
    const noteText = extractText(entryIntArray, cursorIndex);
    entryData.note = noteText.text;
    cursorIndex = cursorIndex + 2 + noteText.textLength;

    //Unknown
    cursorIndex += 9;

    //Birthday
    const birthday = extractDate(entryIntArray, cursorIndex);
    entryData.birthday = birthday;
    cursorIndex += 6;

    //Unknown
    cursorIndex += 4;

    //Birthplace
    const birthPlaceText = extractText(entryIntArray, cursorIndex);
    entryData.birthPlace = birthPlaceText.text;
    cursorIndex = cursorIndex + 2 + birthPlaceText.textLength;

    //Unknown
    cursorIndex += 12;

    //Religion
    const religionText = extractText(entryIntArray, cursorIndex);
    entryData.religion = religionText.text;
    cursorIndex = cursorIndex + 2 + religionText.textLength;

    cursorIndex += 2;

    //Death Date
    entryData.deathDate = extractDate(entryIntArray, cursorIndex);
    cursorIndex += 6;

    //Unknown
    cursorIndex += 4;

    //Death Place
    const deathPlaceText = extractText(entryIntArray, cursorIndex);
    entryData.deathPlace = deathPlaceText.text;
    cursorIndex = cursorIndex + 2 + deathPlaceText.textLength;

    //Unknown
    cursorIndex += 53;

    //Gender
    entryData.gender = entryIntArray[cursorIndex] ? "female" : "male";
    cursorIndex += 1;

    //Unknown
    cursorIndex += 5;

    //Father Reference
    entryData.fatherReference = createid(
      toUint16(entryIntArray[cursorIndex], entryIntArray[cursorIndex + 1]),
      sourceId
    );
    cursorIndex += 2;

    //Mother Reference
    entryData.motherReference = createid(
      toUint16(entryIntArray[cursorIndex], entryIntArray[cursorIndex + 1]),
      sourceId
    );
    cursorIndex += 2;

    //Children
    entryData.children = extractChildren(entryIntArray, cursorIndex, sourceId);
    cursorIndex += 2 + entryData.children.length * 4;

    //Relationships
    entryData.relationships = extractRelationships(
      entryIntArray,
      cursorIndex,
      sourceId
    );
  } catch (error) {
    console.log("Error", error);
    console.log("Could not Parse Entry", entryData);
  }

  // console.log(entryData);
  return entryData;
};

export const parseAhnenFileData = (intArray: Uint8Array, sourceId?: string) => {
  // Split array every occurence of [1,1,1,1]
  let entries: Uint8Array[] = [];
  let startIndex = 0;
  for (let i = 0; i < intArray.length; i++) {
    if (
      intArray[i] === 1 &&
      intArray[i + 1] === 1 &&
      intArray[i + 2] === 1 &&
      intArray[i + 3] === 1 &&
      i > 0
    ) {
      entries.push(intArray.slice(startIndex + 4, i));
      startIndex = i;
      i += 3;
    }
  }

  const parsedEntries = entries.map((entry) => parseEntry(entry, sourceId));
  return parsedEntries;
};

/**
 * IM Hex Structure
#pragma endian little

import std.sys;

struct DATE {
    u16 day;
    u16 month;
    u16 year;
    
};

struct REFERENCE {
    u16 id;
};

struct RELATIONSHIP {
    REFERENCE partner;
    padding[2];
    DATE date;
    padding[4];
    u16 placeLength;
    char place[placeLength];
    padding[4];
};

struct CHILD {
    REFERENCE child;
    u16 childPartnerReference;
};

struct Entry {
	u32 ENTRY_START_PATTERN;
	u16 nameLength;
	char name[nameLength];
	padding[2];
	u16 id;
	padding[4];
	u16 pictureLength;
	char picture[pictureLength];
	u16 jobLength;
	char job[jobLength];
	padding[2];
	u16 noteLength;
	char note[noteLength];
	padding[9];
	DATE birthday;
	padding[4];
	u16 birthPlaceLength;
	char birthPlace[birthPlaceLength];
	padding[12];
	u16 religionLength;
	char religion[religionLength];
	padding[2];
	DATE deathDate;
	padding[4];
	u16 deathPlaceLength;
	char deathPlace[deathPlaceLength];
    padding[53];
    u8 isWoman;
	padding[5];
	REFERENCE father;
	REFERENCE mother;
	u16 childrenLength;
	CHILD children[childrenLength];
	u16 relationshipLength;
	RELATIONSHIP relationships[relationshipLength];
	

};


Entry entry_at_0x00 @ 0x00;
 */
