type CatNames = 'simba' | 'princess' | 'lucky';

interface Cat {
  name: CatNames;
  age: number;
  weight: number;
}

const cats: Cat[] = [
  {
    name: 'simba',
    age: 3,
    weight: 4,
  },
  {
    name: 'lucky',
    age: 5,
    weight: 3,
  },
  {
    name: 'princess',
    age: 2,
    weight: 3.4,
  },
];

function findCatPropertyByName(
  name: string,
  property: Extract<keyof Cat, 'age' | 'weight'>
): number | null {
  const catIndex = cats.findIndex(cat => cat.name === name);
  return catIndex === -1 ? null : cats[catIndex][property]; // so far its ok typescript recognize it can be 'age' or 'weight'
}

console.log(findCatPropertyByName('simba', 'age')); // 3

interface CatsData {
  totalWeight: number;
  simbaName?: string;
  simbaAge?: number;
  simbaWeight?: number;
  luckyName?: string;
  luckyAge?: number;
  luckyWeight?: number;
  princessName?: string;
  princessAge?: number;
  princessWeight?: number;
}

const myCatsData: CatsData = {
  totalWeight: 10.4,
};

// Typescript can infer type this way
// myCatsData[`${cat.name}Name`] = cat.name;

// But in a loop with dynamic array index its not working
cats.forEach(cat => {
  cat.name;
  myCatsData[`${cat.name}Name`] = cat.name;
  myCatsData[`${cat.name}Age`] = cat.age;
  myCatsData[`${cat.name}Weight`] = cat.weight;
});

/*
Error;
myCatsData[`${cat.name}Name`] = cat.name;

Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'CatsData'.
  No index signature with a parameter of type 'string' was found on type 'CatsData'.ts
*/
