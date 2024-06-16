import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // Importe o Prisma Client
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.json());

// Configuração da conexão com o MongoDB
const client = new MongoClient('mongodb+srv://yagohenriquebr:34094445@usuarios.9vr9aqo.mongodb.net/usuarios?retryWrites=true&w=majority&appName=usuarios', { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();
const db = client.db('seuBancoDeDados'); // Substitua 'seuBancoDeDados' pelo nome do seu banco de dados

// Configuração do Prisma
const prisma = new PrismaClient(); // Inicialize o Prisma Client

// Criar usuário
app.post('/usuarios', async (req, res) => {
  const { nome, email, cpf, senha, confirmasenha, genero, nomemae, telefone } = req.body;

  if (senha !== confirmasenha) {
    return res.status(400).json({ message: 'As senhas não coincidem' });
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  await db.collection('usuarios').insertOne({
    nome,
    email,
    cpf,
    senha: hashedPassword,
    confirmasenha: hashedPassword,
    genero,
    nomemae,
    telefone,
  });

  res.status(201).send(req.body);
});

// Listar usuários
app.get('/usuarios', async (req, res) => {
  const { nome, email, cpf, genero, nomemae, telefone } = req.query;

  const query = {};
  if (nome) query.nome = nome;
  if (email) query.email = email;
  if (cpf) query.cpf = cpf;
  if (genero) query.genero = genero;
  if (nomemae) query.nomemae = nomemae;
  if (telefone) query.telefone = telefone;

  const users = await db.collection('usuarios').find(query).toArray();

  res.status(200).json(users);
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await db.collection('usuarios').findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Email ou senha incorretos' });
  }

  const eSenhaValida = await bcrypt.compare(senha, user.senha);

  if (!eSenhaValida) {
    return res.status(401).json({ message: 'Email ou senha incorretos' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

// Rota protegida
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Este é um conteúdo protegido', user: req.user });
});

// Atualizar um usuário existente
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, cpf, senha, confirmasenha, genero, nomemae, telefone } = req.body;

  if (senha !== confirmasenha) {
    return res.status(400).json({ message: 'As senhas não coincidem' });
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  await db.collection('usuarios').updateOne(
    { _id: ObjectId(id) }, // Supondo que você tenha ObjectId do MongoDB
    {
      $set: {
        nome,
        email,
        cpf,
        senha: hashedPassword,
        confirmasenha: hashedPassword,
        genero,
        nomemae,
        telefone,
      },
    }
  );

  res.status(200).json({ message: 'Usuário atualizado com sucesso' });
});

// Deletar um usuário existente
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('usuarios').deleteOne({ _id: ObjectId(id) });
  res.status(200).json({ message: 'Usuário deletado com sucesso' });
});

// Criar artigo
app.post('/artigos', async (req, res) => {
  const { text1, text2, img1, img2, titulo, autor } = req.body;

  try {
    const artigo = await prisma.artigo.create({
      data: { 
        titulo,   
        autor,  
        text1,  
        text2,
        img1,
        img2
      }
    });

    res.status(201).json(artigo);  // Retorne o artigo criado
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    res.status(500).json({ error: 'Erro ao criar artigo' });
  }
});

// Rota para buscar um artigo pelo ID
// Rota para buscar um artigo pelo título
app.get('/artigos/:titulo', async (req, res) => {
  const { titulo } = req.params;

  try {
    const artigo = await db.collection('artigo').findOne({ titulo });

    if (!artigo) {
      return res.status(404).json({ message: 'Artigo não encontrado' });
    }

    res.status(200).json(artigo);
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    res.status(500).json({ error: 'Erro ao buscar artigo' });
  }
});



app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
