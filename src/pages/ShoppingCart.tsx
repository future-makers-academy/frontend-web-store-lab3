import { useEffect, useState } from 'react';
import { Container, Col, Row, Table } from 'reactstrap';

import { OrderForm } from '../components/OrderForm';
import { OrderSummary } from '../components/OrderSummary';
import { ShoppingCartItem } from '../components/ShoppingCartItem';

import { CartItem } from '../api/models/CartItem';
import { Product } from '../api/models/Product';
import { apiClient } from '../api/client/APIClient';

export const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartItemProducts, setCartItemProducts] = useState<Product[]>([]);
    const [cartSubTotal, setCartSubTotal] = useState<number>(0);

    useEffect(() => {
        apiClient.getItemsInCart().then((cartItems) => {
            setCartItems(cartItems);
        });

        /*
        setCartItems([
            {
                id: "1",
                product_id: "1",
                quantity: 1
            },
            {
                id: "2",
                product_id: "2",
                quantity: 2
            },
            {
                id: "3",
                product_id: "3",
                quantity: 5
            },
        ]);
        */
    }, []);

    useEffect(() => {
        Promise.all(cartItems.map(async (cartIt) => 
            await apiClient.getProductById(cartIt.product_id)
        )).then((products) => {
            setCartItemProducts(products);
        });
    }, [cartItems]);

    useEffect(() => {
        updateSubTotal();
    }, [cartItems, cartItemProducts]);

    const updateSubTotal = () => {
        setCartSubTotal(
            cartItems
                .map(item => cartItemProducts.find(product => product.id == item.product_id)?.price || 0)
                .reduce((a, b) => { return a + b; }, 0)
        );
    }

    const removeFromCart = (cartItem: CartItem) => {
        let id = cartItem.id!!;
        apiClient.removeItemFromCart(id).then(() => {
            setCartItems(cartItems.filter(item => item.id != id ));
        });
    }

    const placeOrder = () => {
        apiClient.placeOrder().then(() => {
            setCartItems([]);
        });
    }

    return (
        <>
            <h1>Shopping cart</h1>

            <Container className="text-start">
                <Table hover responsive>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        cartItems.map((cartItem) => 
                            <ShoppingCartItem
                                key={cartItem.id}
                                cartItem={cartItem}
                                removeFromCart={removeFromCart}
                            />
                        )
                    }
                    </tbody>
                </Table>
            </Container>

            <Container className="text-start">
                <Row className="row-cols-2">
                    <Col className="col-9">
                        <OrderForm />
                    </Col>
                    <Col className="col-3">
                        <OrderSummary
                            subTotal={cartSubTotal}
                            taxRate={0}
                            shipping={0}
                            placeOrder={placeOrder}
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
};
