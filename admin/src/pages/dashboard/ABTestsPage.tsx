// src/pages/dashboard/ABTestsPage.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "@/config/BackendUrl";
import { BarChart3, Copy, FlaskConical, Loader2, MoreVertical, Trash2, Power, Eye, Percent } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ABTestOffer {
  offerId: {
    _id: string;
    name: string;
    slug: string;
  };
  percentage: number;
}

interface ABTest {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  offers: ABTestOffer[];
  totalViews: number;
  createdAt: string;
}

export function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testToDelete, setTestToDelete] = useState<ABTest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/abtests`);
      setTests(response.data);
    } catch (error) {
      toast.error("Falha ao carregar testes A/B.", {
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleCopy = (slug: string) => {
    const checkoutBaseUrl =
      window.location.hostname === "localhost"
        ? "https://localhost:5173"
        : "https://pay.snappcheckout.com";

    const url = `${checkoutBaseUrl}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("URL do teste A/B copiada!");
  };

  const handleDelete = async () => {
    if (!testToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/abtests/${testToDelete._id}`);
      toast.success("Teste A/B deletado com sucesso!");
      setTestToDelete(null);
      fetchTests();
    } catch (error) {
      toast.error("Falha ao deletar teste A/B.", {
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (testId: string) => {
    try {
      toast.loading("Duplicando teste A/B...");
      await axios.post(`${API_URL}/abtests/${testId}/duplicate`);
      toast.dismiss();
      toast.success("Teste A/B duplicado com sucesso!");
      fetchTests();
    } catch (error) {
      toast.dismiss();
      toast.error("Falha ao duplicar teste A/B.", {
        description: (error as Error).message,
      });
    }
  };

  const handleToggleActive = async (test: ABTest) => {
    try {
      await axios.put(`${API_URL}/abtests/${test._id}`, {
        isActive: !test.isActive,
      });
      toast.success(test.isActive ? "Teste desativado!" : "Teste ativado!");
      fetchTests();
    } catch (error) {
      toast.error("Falha ao atualizar status.", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="max-w-6xl m-auto">
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Testes A/B</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "..." : `${tests.length} ${tests.length === 1 ? "teste" : "testes"}`}
          </p>
        </div>
        <Button asChild>
          <Link to="/abtests/new">+ Criar Teste A/B</Link>
        </Button>
      </div>

      {/* Tabela */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/50">
              <TableHead className="w-2/5 px-6 py-3 text-xs font-semibold uppercase tracking-wider">Descrição</TableHead>
              <TableHead className="w-36 px-6 py-3 text-xs font-semibold uppercase tracking-wider">Ofertas</TableHead>
              <TableHead className="w-28 px-6 py-3 text-xs font-semibold uppercase tracking-wider">URL</TableHead>
              <TableHead className="w-[70px] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-center">Views</TableHead>
              <TableHead className="w-[100px] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-center">Status</TableHead>
              <TableHead className="px-6 py-3 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  Nenhum teste A/B encontrado.
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <TableRow key={test._id} className="hover:bg-muted/50">
                  {/* DESCRIÇÃO */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                          <FlaskConical className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm text-foreground">{test.name}</div>
                        <div className="text-xs text-muted-foreground">{test.slug}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* OFERTAS */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{test.offers.length} ofertas</span>
                    </div>
                  </TableCell>

                  {/* URL */}
                  <TableCell className="px-6 py-4">
                    <Button variant="link" size="sm" onClick={() => handleCopy(test.slug)} className="text-xs p-0 h-auto text-primary">
                      Copiar Link
                      <Copy className="h-3 w-3 ml-1.5" />
                    </Button>
                  </TableCell>

                  {/* VIEWS */}
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-foreground flex items-center justify-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      {test.totalViews || 0}
                    </span>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell className="px-6 py-4 text-center">
                    <Badge
                      variant="outline"
                      className={
                        test.isActive
                          ? "bg-green-100 text-green-800 border-green-200 font-medium dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                          : "bg-gray-100 text-gray-600 border-gray-200 font-medium dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      }
                    >
                      {test.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  {/* AÇÕES */}
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/abtests/${test._id}`}>Editar</Link>
                      </Button>

                      <Button variant="outline" size="icon" onClick={() => navigate(`/abtests/${test._id}/analytics`)} title="Ver Analytics">
                        <BarChart3 className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleActive(test)}>
                            <Power className="h-4 w-4 mr-2" />
                            {test.isActive ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(test._id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTestToDelete(test)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o teste A/B "{testToDelete?.name}"? Todas as métricas serão perdidas. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ABTestsPage;
