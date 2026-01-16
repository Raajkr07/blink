package com.blink.chatservice.user.repository;

import com.blink.chatservice.user.controller.AuthController;
import com.blink.chatservice.user.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findFirstByEmail(String email); // Use findFirst to handle duplicates
    List<User> findAllByEmail(String email); // Get all users with same email
    Optional<User> findByUsername(String username);
    List<User> findByUsernameContainingIgnoreCase(String username);

    @org.springframework.data.mongodb.repository.Query("{ '$or': [ { 'username': { '$regex': ?0, '$options': 'i' } }, { 'phone': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } }, { 'bio': { '$regex': ?0, '$options': 'i' } } ] }")
    List<User> searchUsers(String query);
    
    List<User> findByOnlineTrue();
}
