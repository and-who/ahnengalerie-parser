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