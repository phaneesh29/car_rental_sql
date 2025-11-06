-- =========================================
-- RENTAL TRIGGERS
-- =========================================

DROP TRIGGER IF EXISTS calculate_rental_amount;

CREATE TRIGGER calculate_rental_amount
BEFORE INSERT ON rental
FOR EACH ROW
BEGIN
    DECLARE rate DECIMAL(10,2);
    DECLARE duration INT;

    -- Fetch rental rate of the car
    SELECT rental_rate INTO rate 
    FROM car 
    WHERE car_id = NEW.car_id;

    -- Calculate duration in days
    SET duration = DATEDIFF(NEW.return_date, NEW.rental_date);
    IF duration <= 0 THEN
        SET duration = 1;
    END IF;

    -- Assign computed values
    SET NEW.rental_duration = duration;
    SET NEW.total_amount = duration * rate;
END;
