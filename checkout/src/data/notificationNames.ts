// src/data/notificationNames.ts
// Lista de nomes populares por idioma e gênero para notificações automáticas

export type Region = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it';
export type Gender = 'male' | 'female';

export const notificationNames: Record<Region, Record<Gender, string[]>> = {
  pt: {
    male: [
      'João', 'Pedro', 'Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Bruno', 'Gustavo', 'Felipe', 'Thiago',
      'Leonardo', 'André', 'Rodrigo', 'Marcelo', 'Eduardo', 'Fernando', 'Diego', 'Carlos', 'Daniel', 'Paulo',
      'Ricardo', 'Marcos', 'Vinicius', 'Alexandre', 'Caio', 'Henrique', 'Leandro', 'Fabio', 'Renato', 'Guilherme',
      'Igor', 'Murilo', 'Otávio', 'Arthur', 'Enzo', 'Bernardo', 'Davi', 'Nicolas', 'Pietro', 'Heitor',
      'Miguel', 'Samuel', 'Cauã', 'Lorenzo', 'Theo', 'Benicio', 'Luan', 'Breno', 'Jorge', 'Tiago'
    ],
    female: [
      'Maria', 'Ana', 'Juliana', 'Beatriz', 'Fernanda', 'Camila', 'Amanda', 'Larissa', 'Mariana', 'Gabriela',
      'Patricia', 'Leticia', 'Carolina', 'Vanessa', 'Bruna', 'Raquel', 'Tatiana', 'Renata', 'Aline', 'Priscila',
      'Natália', 'Isabela', 'Rafaela', 'Daniela', 'Jéssica', 'Vitória', 'Luiza', 'Helena', 'Laura', 'Sofia',
      'Alice', 'Valentina', 'Lívia', 'Lorena', 'Manuela', 'Claúdia', 'Bianca', 'Carla', 'Michele', 'Sandra',
      'Luciana', 'Adriana', 'Simone', 'Eliane', 'Mônica', 'Regina', 'Cláudia', 'Cristina', 'Luana', 'Giovanna'
    ]
  },
  en: {
    male: [
      'James', 'John', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher',
      'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth',
      'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
      'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin',
      'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler'
    ],
    female: [
      'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
      'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
      'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
      'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
      'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather'
    ]
  },
  es: {
    male: [
      'José', 'Carlos', 'Miguel', 'Antonio', 'Juan', 'Luis', 'Francisco', 'Javier', 'Alejandro', 'David',
      'Daniel', 'Manuel', 'Rafael', 'Pedro', 'Pablo', 'Sergio', 'Fernando', 'Jorge', 'Alberto', 'Diego',
      'Andrés', 'Ricardo', 'Eduardo', 'Roberto', 'Raúl', 'Enrique', 'Óscar', 'Adrián', 'Álvaro', 'Rubén',
      'Iván', 'Mario', 'Víctor', 'Jesús', 'Marcos', 'Gonzalo', 'Hugo', 'Héctor', 'Ignacio', 'Jaime',
      'Rodrigo', 'Guillermo', 'Tomás', 'Gabriel', 'Nicolás', 'Mateo', 'Lucas', 'Leo', 'Martín', 'Samuel'
    ],
    female: [
      'María', 'Carmen', 'Ana', 'Isabel', 'Rosa', 'Laura', 'Lucía', 'Paula', 'Elena', 'Marta',
      'Sara', 'Cristina', 'Patricia', 'Sofía', 'Julia', 'Andrea', 'Raquel', 'Beatriz', 'Claudia', 'Silvia',
      'Alba', 'Nuria', 'Irene', 'Pilar', 'Rocío', 'Angeles', 'Teresa', 'Alicia', 'Eva', 'Natalia',
      'Victoria', 'Carolina', 'Lorena', 'Mónica', 'Verónica', 'Sandra', 'Esther', 'Marina', 'Noelia', 'Gabriela',
      'Valentina', 'Daniela', 'Alejandra', 'Camila', 'Adriana', 'Fernanda', 'Mariana', 'Diana', 'Carla', 'Inés'
    ]
  },
  fr: {
    male: [
      'Jean', 'Pierre', 'Louis', 'Michel', 'Jacques', 'Philippe', 'François', 'Nicolas', 'Thomas', 'Antoine',
      'Christophe', 'Laurent', 'Julien', 'David', 'Mathieu', 'Alexandre', 'Sébastien', 'Éric', 'Olivier', 'Patrick',
      'Guillaume', 'Maxime', 'Romain', 'Vincent', 'Benjamin', 'Stéphane', 'Florian', 'Lucas', 'Quentin', 'Hugo',
      'Adrien', 'Théo', 'Gabriel', 'Raphaël', 'Arthur', 'Paul', 'Léo', 'Nathan', 'Enzo', 'Louis',
      'Jules', 'Clément', 'Victor', 'Luca', 'Adam', 'Étienne', 'Valentin', 'Samuel', 'Alexis', 'Damien'
    ],
    female: [
      'Marie', 'Sophie', 'Claire', 'Isabelle', 'Catherine', 'Nathalie', 'Sandrine', 'Christine', 'Valérie', 'Julie',
      'Émilie', 'Camille', 'Léa', 'Manon', 'Chloé', 'Laura', 'Sarah', 'Marion', 'Pauline', 'Charlotte',
      'Aurélie', 'Céline', 'Stéphanie', 'Virginie', 'Caroline', 'Lucie', 'Anaïs', 'Marine', 'Mathilde', 'Margot',
      'Alice', 'Louise', 'Emma', 'Inès', 'Jade', 'Zoé', 'Lola', 'Clara', 'Juliette', 'Justine',
      'Élodie', 'Anne', 'Laetitia', 'Delphine', 'Audrey', 'Mélanie', 'Océane', 'Eva', 'Noémie', 'Lisa'
    ]
  },
  de: {
    male: [
      'Michael', 'Thomas', 'Andreas', 'Peter', 'Wolfgang', 'Klaus', 'Christian', 'Stefan', 'Jürgen', 'Markus',
      'Matthias', 'Frank', 'Daniel', 'Sebastian', 'Alexander', 'Martin', 'Tobias', 'Florian', 'Jan', 'Patrick',
      'David', 'Maximilian', 'Felix', 'Tim', 'Jonas', 'Leon', 'Lukas', 'Paul', 'Ben', 'Noah',
      'Philipp', 'Simon', 'Niklas', 'Marcel Marcel', 'Manuel', 'Dominik', 'Julian', 'Kevin', 'Dennis', 'Oliver',
      'Fabian', 'Johannes', 'Christoph', 'Raphael', 'Moritz', 'Erik', 'Lennart', 'Jakob', 'Anton', 'Emil'
    ],
    female: [
      'Maria', 'Anna', 'Lisa', 'Laura', 'Julia', 'Sarah', 'Sophie', 'Katharina', 'Lena', 'Marie',
      'Stefanie', 'Melanie', 'Nicole', 'Sandra', 'Sabrina', 'Christina', 'Andrea', 'Petra', 'Martina', 'Claudia',
      'Emma', 'Hannah', 'Mia', 'Lea', 'Charlotte', 'Emily', 'Johanna', 'Paula', 'Sophia', 'Emilia',
      'Franziska', 'Michelle', 'Jennifer', 'Vanessa', 'Jasmin', 'Nadine', 'Annika', 'Carina', 'Diana', 'Eva',
      'Isabel', 'Janina', 'Theresa', 'Victoria', 'Alina', 'Amelie', 'Elena', 'Nele', 'Frieda', 'Greta'
    ]
  },
  it: {
    male: [
      'Giuseppe', 'Antonio', 'Marco', 'Giovanni', 'Francesco', 'Mario', 'Luigi', 'Luca', 'Andrea', 'Alessandro',
      'Matteo', 'Roberto', 'Stefano', 'Paolo', 'Carlo', 'Vincenzo', 'Salvatore', 'Lorenzo', 'Davide', 'Riccardo',
      'Simone', 'Federico', 'Pietro', 'Michele', 'Nicola', 'Tommaso', 'Gabriele', 'Daniele', 'Leonardo', 'Emanuele',
      'Fabio', 'Angelo', 'Massimo', 'Alberto', 'Giorgio', 'Claudio', 'Filippo', 'Enrico', 'Giacomo', 'Sergio',
      'Alessio', 'Christian', 'Domenico', 'Diego', 'Edoardo', 'Gianluca', 'Samuele', 'Valerio', 'Cristian', 'Mattia'
    ],
    female: [
      'Maria', 'Anna', 'Giulia', 'Sara', 'Laura', 'Chiara', 'Francesca', 'Elena', 'Alessia', 'Martina',
      'Sofia', 'Valentina', 'Giorgia', 'Federica', 'Silvia', 'Elisa', 'Lucia', 'Serena', 'Roberta', 'Claudia',
      'Ilaria', 'Stefania', 'Monica', 'Beatrice', 'Alessandra', 'Veronica', 'Simona', 'Cristina', 'Elisabetta', 'Paola',
      'Alice', 'Arianna', 'Giada', 'Camilla', 'Aurora', 'Greta', 'Vittoria', 'Emma', 'Matilde', 'Nicole',
      'Marta', 'Carlotta', 'Rebecca', 'Viola', 'Ludovica', 'Ginevra', 'Bianca', 'Miriam', 'Isabella', 'Angelica'
    ]
  }
};
