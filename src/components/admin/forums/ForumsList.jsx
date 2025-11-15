import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Input, Select, Tag, Badge, Avatar, 
  Popconfirm, message, Modal, Form, Input as AntInput, Divider, Card,
  Tabs, List, Comment, Tooltip, Typography, Empty
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, FilterOutlined, MessageOutlined, LikeOutlined,
  EyeOutlined, PushpinFilled, LockFilled, CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/fr';
import api from '../../../../services/api';

const { Search } = AntInput;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

// Formatter pour les dates
moment.locale('fr');

const ForumsList = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingForum, setEditingForum] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Catégories de forum
  const forumCategories = [
    { value: 'general', label: 'Général', color: 'blue' },
    { value: 'technique', label: 'Technique', color: 'geekblue' },
    { value: 'sante', label: 'Santé', color: 'green' },
    { value: 'alimentation', label: 'Alimentation', color: 'lime' },
    { value: 'equipement', label: 'Équipement', color: 'orange' },
    { value: 'vente', label: 'Vente', color: 'purple' },
    { value: 'achat', label: 'Achat', color: 'cyan' },
    { value: 'conseils', label: 'Conseils', color: 'gold' },
  ];

  // Récupérer la liste des forums
  const { data: forums = [], isLoading } = useQuery(['forums', filters], async () => {
    const params = {};
    if (filters.search) params.q = filters.search;
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.status !== 'all') params.status = filters.status;
    
    const { data } = await api.get('/api/forums', { params });
    return data.data || [];
  });

  // Créer un nouveau forum
  const createForum = useMutation(
    async (values) => {
      const { data } = await api.post('/api/forums', values);
      return data;
    },
    {
      onSuccess: () => {
        message.success('Forum créé avec succès');
        queryClient.invalidateQueries('forums');
        setIsModalVisible(false);
        form.resetFields();
      },
      onError: (error) => {
        message.error(error.response?.data?.message || 'Une erreur est survenue');
      },
    }
  );

  // Mettre à jour un forum
  const updateForum = useMutation(
    async (values) => {
      const { data } = await api.put(`/api/forums/${editingForum.id}`, values);
      return data;
    },
    {
      onSuccess: () => {
        message.success('Forum mis à jour avec succès');
        queryClient.invalidateQueries('forums');
        setIsModalVisible(false);
        setEditingForum(null);
        form.resetFields();
      },
      onError: (error) => {
        message.error(error.response?.data?.message || 'Une erreur est survenue');
      },
    }
  );

  // Supprimer un forum
  const deleteForum = useMutation(
    async (forumId) => {
      await api.delete(`/api/forums/${forumId}`);
    },
    {
      onSuccess: () => {
        message.success('Forum supprimé avec succès');
        queryClient.invalidateQueries('forums');
      },
      onError: (error) => {
        message.error(error.response?.data?.message || 'Une erreur est survenue');
      },
    }
  );

  // Gérer la soumission du formulaire
  const handleSubmit = (values) => {
    if (editingForum) {
      updateForum.mutate(values);
    } else {
      createForum.mutate(values);
    }
  };

  // Gérer l'édition d'un forum
  const handleEdit = (forum) => {
    setEditingForum(forum);
    form.setFieldsValue({
      title: forum.title,
      content: forum.content,
      category: forum.category,
      tags: forum.tags,
      isPinned: forum.isPinned,
      isClosed: forum.isClosed,
    });
    setIsModalVisible(true);
  };

  // Gérer le changement d'onglet
  const handleTabChange = (key) => {
    setActiveTab(key);
    setFilters({
      ...filters,
      status: key === 'all' ? 'all' : key
    });
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-2">
            {record.isPinned && <PushpinFilled className="text-yellow-500 mr-1" />}
            {record.isClosed && <LockFilled className="text-red-500" />}
          </div>
          <div>
            <div className="font-medium">
              <Link to={`/forums/${record._id}`} className="hover:text-blue-600">
                {text}
              </Link>
            </div>
            <div className="text-xs text-gray-500">
              Par {record.author?.firstName} {record.author?.lastName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => {
        const cat = forumCategories.find(c => c.value === category);
        return cat ? (
          <Tag color={cat.color}>
            {cat.label}
          </Tag>
        ) : null;
      },
    },
    {
      title: 'Réponses',
      dataIndex: 'replies',
      key: 'replies',
      width: 100,
      render: (replies) => (
        <div className="flex items-center">
          <MessageOutlined className="mr-1" />
          {replies?.length || 0}
        </div>
      ),
    },
    {
      title: 'Vues',
      dataIndex: 'views',
      key: 'views',
      width: 80,
      render: (views) => (
        <div className="flex items-center">
          <EyeOutlined className="mr-1" />
          {views || 0}
        </div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'isClosed',
      key: 'status',
      width: 100,
      render: (isClosed) => (
        <Tag color={isClosed ? 'red' : 'green'}>
          {isClosed ? 'Fermé' : 'Ouvert'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce forum ?"
            onConfirm={() => deleteForum.mutate(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold mb-4 md:mb-0">Gestion des forums</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingForum(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Nouveau sujet
        </Button>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <Search
            placeholder="Rechercher un forum..."
            prefix={<SearchOutlined />}
            className="w-full md:w-64"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          
          <Select
            placeholder="Catégorie"
            className="w-full md:w-48"
            value={filters.category}
            onChange={(value) => setFilters({ ...filters, category: value })}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Toutes les catégories</Option>
            {forumCategories.map(cat => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Statut"
            className="w-full md:w-40"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Tous les statuts</Option>
            <Option value="open">Ouverts</Option>
            <Option value="closed">Fermés</Option>
          </Select>

          <Button 
            onClick={() => setFilters({ search: '', category: 'all', status: 'all' })}
          >
            Réinitialiser
          </Button>
        </div>
      </Card>

      {/* Onglets */}
      <Tabs 
        activeKey={activeTab}
        onChange={handleTabChange}
        className="mb-4"
      >
        <TabPane tab="Tous les sujets" key="all" />
        <TabPane tab="Ouverts" key="open" />
        <TabPane tab="Fermés" key="closed" />
        <TabPane tab="Épinglés" key="pinned" />
      </Tabs>

      {/* Liste des forums */}
      <Card>
        <Table
          columns={columns}
          dataSource={forums}
          rowKey="_id"
          loading={isLoading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} sujets`,
          }}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Empty
                description="Aucun forum trouvé"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Modal d'ajout/édition */}
      <Modal
        title={editingForum ? 'Modifier le forum' : 'Nouveau sujet de forum'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingForum(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: 'general',
            isPinned: false,
            isClosed: false,
            tags: [],
          }}
        >
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
          >
            <Input placeholder="Titre du sujet" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Contenu"
            rules={[{ required: true, message: 'Veuillez entrer un contenu' }]}
          >
            <Input.TextArea rows={6} placeholder="Contenu du sujet" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label="Catégorie"
              rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
            >
              <Select placeholder="Sélectionner une catégorie">
                {forumCategories.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tags"
              label="Mots-clés (séparés par des virgules)"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Ajouter des mots-clés"
                tokenSeparators={[',']}
              />
            </Form.Item>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-x-4">
              <Form.Item name="isPinned" valuePropName="checked" noStyle>
                <Checkbox>Épingler ce sujet</Checkbox>
              </Form.Item>
              <Form.Item name="isClosed" valuePropName="checked" noStyle>
                <Checkbox>Fermer ce sujet</Checkbox>
              </Form.Item>
            </div>

            <div className="space-x-2">
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingForum(null);
                }}
              >
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createForum.isLoading || updateForum.isLoading}
              >
                {editingForum ? 'Mettre à jour' : 'Publier'}
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ForumsList;
