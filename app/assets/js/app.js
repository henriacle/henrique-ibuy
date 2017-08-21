(function(ng) {
    ng.module('ng-ibuy', ['ngRoute'])
    
    .config(function($routeProvider){
        $routeProvider
            .when('/', {
                controller: 'ProdutosController as produtos',
                templateUrl: '/app/templates/produtos.html'
            })
            .when('/carrinho', {
                controller: 'CarrinhoController as carrinho',
                templateUrl: '/app/templates/carrinho.html'
            })
            .when('/detalhe', {
                controller: 'DetalheController as detalhe',
                templateUrl: '/app/templates/detalhe.html'
            })            
            .when('/login', {
                controller: 'LoginController as login',
                templateUrl: '/app/templates/login.html'
            })
            .when('/meus-pedidos', {
                controller: 'PedidosController as pedidos',
                templateUrl: '/app/templates/pedidos.html'
            })            
    })

    .run(function($rootScope, LoginService){
        var mainView = document.getElementById('main-view');
        mainView.style.minHeight = window.innerHeight - 238 + 'px';

        $rootScope.$on('$routeChangeStart', function(next, current) { 
            $rootScope.userData = LoginService.isLogged();
        });
    })

    .service('LoginService', ['$q', '$location', function($q, $location) {
        
        var loggedData = {
            userName: "Henrique",
            isLogged: false
        }

        login = function(userData) {
            loggedData.isLogged = true;
            $location.path('/carrinho');
        }

        getLoginStatus = function() {
            return loggedData;
        }

        return {
            isLogged: getLoginStatus,
            login : login
        }
    }])

    .service('PedidosServices', ['$http', '$location', 'ProductServices', function($http, $location, ProductServices) {
        var pedidos = [];

        getPedidos = function() {
            return pedidos;
        }

        setPedidos = function(pedido) {
            pedidos.push(pedido);
            $location.path('/meus-pedidos');
            ProductServices.resetSelectedProducts();
            console.log(getPedidos());
        }

        return {
            getPedidos : getPedidos,
            setPedidos : setPedidos,
        }
    }])

    .service('ProductServices', ['$http', '$q', function($http, $q){
        var selectedProducts = [];
        var selectedProduct = {
     
        };

        getProdutos = function() {
            var config = {
                url: 'app/assets/data/produtos.json',
                method: 'GET'
            }

            var call = $http(config).then((resp) => {
                return resp;
            })
            
            return call;
        }

        selectProduct = function(produto) {
            verifyExistingProduct(produto).then(function(val) {
                if(!val) {
                    selectedProducts.push(produto);
                }
            });
        }

        getSelectedProducts = function() {
            return selectedProducts;
        }

        resetSelectedProducts = function() {
            for(var i = selectedProducts.length; i >= 0; i--) {
                selectedProducts.splice(i, 1);
            }

            console.log(selectedProducts);
        }

        removeSelectedProduct = function(index) {
            selectedProducts.splice(index, 1);
        }        

        verifyExistingProduct = function(produto) {
            return $q(function(resolve, reject) {
                var found = false;
                
                for(var k in selectedProducts) {
                    if(selectedProducts[k].id === produto.id) {
                       if(selectedProducts[k].qtd) {
                        selectedProducts[k].qtd++;
                       }
                       found = true;
                    }
                }

                if(!found) {
                    produto.qtd = 1;
                }

                resolve(found);
            });
        }

        productDetail = function(produto) {
            selectedProduct = produto;
        }

        getSelectedProduct = function() {
            return selectedProduct;
        }

        return {
            verDetalhesDoProduto : productDetail,
            carregaDetalhe : getSelectedProduct,
            carregaProdutos : getProdutos,
            selecionaProduto : selectProduct,
            carregaProdutosSelecionados: getSelectedProducts,
            removeItem: removeSelectedProduct,
            resetSelectedProducts : resetSelectedProducts 
        }
    }])

    .controller('ProdutosController', ['$scope', '$location', 'ProductServices', function($scope, $location, ProductServices) {
        var produtosController = this;

        ProductServices.carregaProdutos().then(function(resp) {
            produtosController.listaDeProdutos = resp.data;
        });

        produtosController.selecionaProduto = function(produto) {
            ProductServices.selecionaProduto(produto);
        }

        produtosController.verDetalhes = function(produto) {
            ProductServices.verDetalhesDoProduto(produto);
            $location.path('/detalhe');
        }        
    }])

    .controller('LoginController', ['$scope', '$location', 'LoginService', function($scope, $location, LoginService) {
        var loginController = this;

        loginController.entrar = function(data) {
            LoginService.login(data);
        }
    }])

    .controller('DetalheController', ['$scope', 'ProductServices', function($scope, ProductServices) {
        var detalheController = this;

        detalheController.produto = ProductServices.carregaDetalhe();

        detalheController.selecionaProduto = function(produto) {
            ProductServices.selecionaProduto(produto);
        }        
    }])    

    .controller('CarrinhoController', ['$scope', '$rootScope', '$location', '$filter', 'ProductServices', 'PedidosServices', 
        function($scope, $rootScope, $location, $filter, ProductServices, PedidosServices) {
        var carrinhoController = this; 

        carrinhoController.produtosSelecionados = ProductServices.carregaProdutosSelecionados();

        carrinhoController.remove = function(index) {
            ProductServices.removeItem(index);
            carrinhoController.produtosSelecionados = ProductServices.carregaProdutosSelecionados();
        }

        carrinhoController.fecharPedido = function(produtos) {
            if(!$rootScope.userData.isLogged) {
                $location.path('/login');
            } else {
                var pedido = {
                    idPedido : (Math.random() * 1000),
                    dataDoPedido: new Date(),
                    produtosSelecionados: JSON.parse(JSON.stringify(produtos)),
                    total: $filter('somaTotal')(produtos)
                }
    
                PedidosServices.setPedidos(pedido);
            }
        }
    }])

    .controller('PedidosController', ['$scope', '$rootScope', '$location', '$filter', 'ProductServices', 'PedidosServices', 
    function($scope, $rootScope, $location, $filter, ProductServices, PedidosServices) {
        var PedidosController = this; 

        PedidosController.listaPedidos = PedidosServices.getPedidos();
}])    

    .directive('openCart', ['ProductServices', function(ProductServices) {
        return {
            restrict: 'E',
            templateUrl: '/app/templates/carrinho-flutuante.html',
            scope: '=',
            link: function(scope, el, attr) {
                el.addClass('cursor');

                var element = angular.element(el);
                var cart = document.querySelectorAll('.selected-products');

                scope.produtosSelecionados = ProductServices.carregaProdutosSelecionados();

                element.on('click', function() {
                   angular.element(cart).toggleClass('active');
                });
            }
        }
    }])

    .filter('somaTotal', function() {
        function soma(valores) {
            var total = 0;

            for(var k in valores) {
                total = total + (valores[k].currentPrice * valores[k].qtd);
            }

            return total;
        }

        return soma;
    })
})(angular)